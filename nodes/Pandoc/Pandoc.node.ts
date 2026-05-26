import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

const execAsync = promisify(exec);

export class Pandoc implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pandoc',
		name: 'pandoc',
		icon: 'file:pandoc.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["fromFormat"] + " → " + $parameter["toFormat"]}}',
		description: 'Convert documents between various formats using Pandoc',
		defaults: {
			name: 'Pandoc',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Convert',
						value: 'convert',
						description: 'Convert document from one format to another',
					},
				],
				default: 'convert',
			},
			{
				displayName: 'Input Type',
				name: 'inputType',
				type: 'options',
				options: [
					{
						name: 'Binary Data',
						value: 'binary',
						description: 'Input from binary data field',
					},
					{
						name: 'Text',
						value: 'text',
						description: 'Input from text parameter',
					},
				],
				default: 'text',
				description: 'Type of input data',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						inputType: ['binary'],
					},
				},
				description: 'Name of the binary property containing the input file',
			},
			{
				displayName: 'Input Text',
				name: 'inputText',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						inputType: ['text'],
					},
				},
				description: 'Text content to convert',
			},
			{
				displayName: 'From Format',
				name: 'fromFormat',
				type: 'options',
				options: [
					{ name: 'Auto (detect)', value: 'auto' },
					{ name: 'BibLaTeX', value: 'biblatex' },
					{ name: 'BibTeX', value: 'bibtex' },
					{ name: 'CommonMark', value: 'commonmark' },
					{ name: 'CommonMark (with extensions)', value: 'commonmark_x' },
					{ name: 'Creole', value: 'creole' },
					{ name: 'CSV', value: 'csv' },
					{ name: 'DocBook', value: 'docbook' },
					{ name: 'Docx', value: 'docx' },
					{ name: 'DokuWiki', value: 'dokuwiki' },
					{ name: 'EPUB', value: 'epub' },
					{ name: 'FictionBook2', value: 'fb2' },
					{ name: 'GitHub-Flavored Markdown', value: 'gfm' },
					{ name: 'Haddock', value: 'haddock' },
					{ name: 'HTML', value: 'html' },
					{ name: 'JATS', value: 'jats' },
					{ name: 'Jira Wiki', value: 'jira' },
					{ name: 'JSON (Pandoc AST)', value: 'json' },
					{ name: 'Jupyter Notebook', value: 'ipynb' },
					{ name: 'LaTeX', value: 'latex' },
					{ name: 'Man', value: 'man' },
					{ name: 'Markdown (Pandoc)', value: 'markdown' },
					{ name: 'Markdown (PHP Extra)', value: 'markdown_phpextra' },
					{ name: 'Markdown (strict)', value: 'markdown_strict' },
					{ name: 'MediaWiki', value: 'mediawiki' },
					{ name: 'Muse', value: 'muse' },
					{ name: 'Native (Haskell)', value: 'native' },
					{ name: 'ODT', value: 'odt' },
					{ name: 'OPML', value: 'opml' },
					{ name: 'Org-mode', value: 'org' },
					{ name: 'reStructuredText', value: 'rst' },
					{ name: 'RTF', value: 'rtf' },
					{ name: 'Textile', value: 'textile' },
					{ name: 'TikiWiki', value: 'tikiwiki' },
					{ name: 'TWiki', value: 'twiki' },
					{ name: 'Txt2Tags', value: 't2t' },
					{ name: 'Vimwiki', value: 'vimwiki' },
				],
				default: 'markdown',
				description: 'Format of the input document',
			},
			{
				displayName: 'To Format',
				name: 'toFormat',
				type: 'options',
				options: [
					{ name: 'AsciiDoc', value: 'asciidoc' },
					{ name: 'AsciiDoctor', value: 'asciidoctor' },
					{ name: 'Beamer', value: 'beamer' },
					{ name: 'BibLaTeX', value: 'biblatex' },
					{ name: 'BibTeX', value: 'bibtex' },
					{ name: 'CommonMark', value: 'commonmark' },
					{ name: 'CommonMark (with extensions)', value: 'commonmark_x' },
					{ name: 'ConTeXt', value: 'context' },
					{ name: 'DocBook 4', value: 'docbook4' },
					{ name: 'DocBook 5', value: 'docbook5' },
					{ name: 'Docx', value: 'docx' },
					{ name: 'DokuWiki', value: 'dokuwiki' },
					{ name: 'EPUB 2', value: 'epub2' },
					{ name: 'EPUB 3', value: 'epub3' },
					{ name: 'FictionBook2', value: 'fb2' },
					{ name: 'GitHub-Flavored Markdown', value: 'gfm' },
					{ name: 'Haddock', value: 'haddock' },
					{ name: 'HTML 4', value: 'html4' },
					{ name: 'HTML 5', value: 'html5' },
					{ name: 'ICML', value: 'icml' },
					{ name: 'JATS', value: 'jats' },
					{ name: 'Jira Wiki', value: 'jira' },
					{ name: 'JSON (Pandoc AST)', value: 'json' },
					{ name: 'Jupyter Notebook', value: 'ipynb' },
					{ name: 'LaTeX', value: 'latex' },
					{ name: 'Man', value: 'man' },
					{ name: 'Markdown (Pandoc)', value: 'markdown' },
					{ name: 'Markdown (PHP Extra)', value: 'markdown_phpextra' },
					{ name: 'Markdown (strict)', value: 'markdown_strict' },
					{ name: 'MediaWiki', value: 'mediawiki' },
					{ name: 'Muse', value: 'muse' },
					{ name: 'Native (Haskell)', value: 'native' },
					{ name: 'ODT', value: 'odt' },
					{ name: 'OPML', value: 'opml' },
					{ name: 'OpenDocument XML', value: 'opendocument' },
					{ name: 'Org-mode', value: 'org' },
					{ name: 'PDF', value: 'pdf' },
					{ name: 'Plain Text', value: 'plain' },
					{ name: 'PowerPoint', value: 'pptx' },
					{ name: 'reStructuredText', value: 'rst' },
					{ name: 'RTF', value: 'rtf' },
					{ name: 'Texinfo', value: 'texinfo' },
					{ name: 'Textile', value: 'textile' },
					{ name: 'TikiWiki', value: 'tikiwiki' },
					{ name: 'TWiki', value: 'twiki' },
					{ name: 'Txt2Tags', value: 't2t' },
					{ name: 'XWiki', value: 'xwiki' },
					{ name: 'ZimWiki', value: 'zimwiki' },
				],
				default: 'html5',
				description: 'Format of the output document',
			},
			{
				displayName: 'Output Type',
				name: 'outputType',
				type: 'options',
				options: [
					{
						name: 'Binary Data',
						value: 'binary',
						description: 'Output as binary data field',
					},
					{
						name: 'Text',
						value: 'text',
						description: 'Output as text in JSON',
					},
				],
				default: 'text',
				description: 'Type of output data',
			},
			{
				displayName: 'Binary Property',
				name: 'outputBinaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						outputType: ['binary'],
					},
				},
				description: 'Name of the binary property to store the output file',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Standalone',
						name: 'standalone',
						type: 'boolean',
						default: true,
						description: 'Whether to produce a standalone document (with header and footer)',
					},
					{
						displayName: 'Table of Contents',
						name: 'toc',
						type: 'boolean',
						default: false,
						description: 'Whether to include a table of contents',
					},
					{
						displayName: 'Number Sections',
						name: 'numberSections',
						type: 'boolean',
						default: false,
						description: 'Whether to number sections',
					},
					{
						displayName: 'Self Contained',
						name: 'selfContained',
						type: 'boolean',
						default: false,
						description: 'Whether to produce a self-contained document (embed images, CSS, etc.)',
					},
					{
						displayName: 'Wrap',
						name: 'wrap',
						type: 'options',
						options: [
							{ name: 'Auto', value: 'auto' },
							{ name: 'None', value: 'none' },
							{ name: 'Preserve', value: 'preserve' },
						],
						default: 'auto',
						description: 'Text wrapping mode',
					},
					{
						displayName: 'Columns',
						name: 'columns',
						type: 'number',
						default: 72,
						description: 'Column width for text wrapping',
					},
					{
						displayName: 'Custom Pandoc Arguments',
						name: 'customArgs',
						type: 'string',
						default: '',
						description: 'Additional command-line arguments to pass to Pandoc',
						placeholder: '--pdf-engine=xelatex --highlight-style=tango',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const inputType = this.getNodeParameter('inputType', itemIndex) as string;
				const fromFormat = this.getNodeParameter('fromFormat', itemIndex) as string;
				const toFormat = this.getNodeParameter('toFormat', itemIndex) as string;
				const outputType = this.getNodeParameter('outputType', itemIndex) as string;
				const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as {
					standalone?: boolean;
					toc?: boolean;
					numberSections?: boolean;
					selfContained?: boolean;
					wrap?: string;
					columns?: number;
					customArgs?: string;
				};

				// Generate temporary file names
				const tmpId = randomBytes(16).toString('hex');
				const inputFile = join(tmpdir(), `pandoc-input-${tmpId}`);
				const outputFile = join(tmpdir(), `pandoc-output-${tmpId}`);

				try {
					// Write input to temporary file
					if (inputType === 'binary') {
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;
						const inputBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
						await writeFile(inputFile, inputBuffer);
					} else {
						const inputText = this.getNodeParameter('inputText', itemIndex) as string;
						await writeFile(inputFile, inputText, 'utf-8');
					}

					// Build Pandoc command
					const args: string[] = [];

					// Input format
					if (fromFormat !== 'auto') {
						args.push(`--from=${fromFormat}`);
					}

					// Output format
					args.push(`--to=${toFormat}`);

					// Additional options
					if (additionalOptions.standalone) {
						args.push('--standalone');
					}
					if (additionalOptions.toc) {
						args.push('--toc');
					}
					if (additionalOptions.numberSections) {
						args.push('--number-sections');
					}
					if (additionalOptions.selfContained) {
						args.push('--self-contained');
					}
					if (additionalOptions.wrap) {
						args.push(`--wrap=${additionalOptions.wrap}`);
					}
					if (additionalOptions.columns) {
						args.push(`--columns=${additionalOptions.columns}`);
					}
					if (additionalOptions.customArgs) {
						args.push(additionalOptions.customArgs);
					}

					// Input and output files
					args.push(`-o "${outputFile}"`);
					args.push(`"${inputFile}"`);

					const command = `pandoc ${args.join(' ')}`;

					// Execute Pandoc
					const { stderr } = await execAsync(command);

					if (stderr) {
						// Log warning but continue
					}

					// Read output
					if (outputType === 'binary') {
						const outputBuffer = await readFile(outputFile);
						const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', itemIndex) as string;
						
						// Determine MIME type based on output format
						let mimeType = 'application/octet-stream';
						const mimeTypes: { [key: string]: string } = {
							pdf: 'application/pdf',
							docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
							odt: 'application/vnd.oasis.opendocument.text',
							epub: 'application/epub+zip',
							epub2: 'application/epub+zip',
							epub3: 'application/epub+zip',
							pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
							html: 'text/html',
							html4: 'text/html',
							html5: 'text/html',
							rtf: 'application/rtf',
							latex: 'application/x-latex',
							json: 'application/json',
							xml: 'application/xml',
						};
						
						if (mimeTypes[toFormat]) {
							mimeType = mimeTypes[toFormat];
						}

						const binaryData = await this.helpers.prepareBinaryData(
							outputBuffer,
							`output.${toFormat}`,
							mimeType
						);

						returnData.push({
							json: items[itemIndex].json,
							binary: {
								[outputBinaryPropertyName]: binaryData,
							},
						});
					} else {
						const outputText = await readFile(outputFile, 'utf-8');
						returnData.push({
							json: {
								...items[itemIndex].json,
								output: outputText,
								fromFormat,
								toFormat,
							},
						});
					}
				} finally {
					// Clean up temporary files
					try {
						await unlink(inputFile);
					} catch {
						// Ignore errors
					}
					try {
						await unlink(outputFile);
					} catch {
						// Ignore errors
					}
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: errorMessage,
						},
						pairedItem: {
							item: itemIndex,
						},
					});
					continue;
				}
				throw new NodeOperationError(
					this.getNode(),
					error instanceof Error ? error : new Error(errorMessage),
					{
						itemIndex,
					},
				);
			}
		}

		return [returnData];
	}
}
