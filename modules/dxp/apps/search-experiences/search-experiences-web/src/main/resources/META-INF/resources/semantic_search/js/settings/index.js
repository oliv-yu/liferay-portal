/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 */

import ClayAutocomplete from '@clayui/autocomplete';
import {useResource} from '@clayui/data-provider';
import ClayForm, {ClayCheckbox, ClayInput, ClaySelect} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import ClayLayout from '@clayui/layout';
import {ClayTooltipProvider} from '@clayui/tooltip';
import getCN from 'classnames';
import {useFormik} from 'formik';
import React, {useState} from 'react';

import {sub} from '../../../sxp_blueprint_admin/js/utils/language';

/**
 * Formats the object into an array of key and label, commonly used for inputs
 * that require listing out options. If object is actually a flat array, this formats
 * the items into key-label pairs.
 * @param {Object} items Items formatted like {en_US: 'English', es_ES: 'Spanish'}
 * @return {Array} [{key: 'en_US', label: 'English'}, {key: 'es_ES', label: 'Spanish'}]
 */
const getEntries = (items = {}) => {
	if (Array.isArray(items)) {
		return items.map((item) => ({
			key: item,
			label: item,
		}));
	}

	return Object.entries(items).map(([key, label]) => ({
		key,
		label,
	}));
};

function ModelAutocomplete({
	label,
	name,
	onBlur,
	onChange,
	required,
	value = '',
}) {
	const [networkStatus, setNetworkStatus] = useState(4);

	const {resource} = useResource({
		fetchPolicy: 'cache-first',
		link: `${
			window.location.origin
		}${Liferay.ThemeDisplay.getPathContext()}/o/search-experiences-rest/v1.0/sentence-transformer/ml-models`,
		onNetworkStatusChange: setNetworkStatus,
		variables: {limit: 20, query: value},
	});

	return (
		<ClayAutocomplete
			aria-labelledby={label}
			id={name}
			items={(resource?.items || []).map(({modelId}) => modelId)}
			loadingState={networkStatus}
			messages={{
				loading: Liferay.Language.get('loading'),
				notFound: Liferay.Language.get('no-results-found'),
			}}
			name={name}
			onBlur={onBlur}
			onChange={onChange}
			onItemsChange={() => {}}
			required={required}
			value={value}
		>
			{(item) => (
				<ClayAutocomplete.Item key={item}>{item}</ClayAutocomplete.Item>
			)}
		</ClayAutocomplete>
	);
}

function MultiSelection({name, onBlur, onChange, required, value = [], items}) {
	const _handleChange = (key) => {
		onChange(
			value.includes(key)
				? value.filter((id) => id !== key)
				: [...value, key]
		);
	};

	const _renderCheckbox = (item) => (
		<ClayCheckbox
			aria-label={item.label}
			checked={value.includes(item.key)}
			key={item.key}
			label={item.label}
			onBlur={onBlur}
			onChange={() => _handleChange(item.key)}
		/>
	);

	return (
		<ClayLayout.ContainerFluid style={{paddingBottom: 0}} view>
			<ClayLayout.Row justify="start">
				<ClayLayout.Col size={6}>
					{items
						.slice(0, Math.ceil(items.length / 2))
						.map((item) => _renderCheckbox(item))}
				</ClayLayout.Col>

				<ClayLayout.Col size={6}>
					{items
						.slice(Math.ceil(items.length / 2))
						.map((item) => _renderCheckbox(item))}
				</ClayLayout.Col>
			</ClayLayout.Row>

			{value.map((key) => (
				<input hidden key={key} name={name} readOnly value={key} />
			))}

			{required && !value.length && (
				<input
					hidden
					name={name}
					onChange={() => {}}
					required
					value=""
				/>
			)}
		</ClayLayout.ContainerFluid>
	);
}

function Input({
	error,
	formText,
	helpText,
	label,
	name,
	onBlur,
	onChange,
	items,
	options = {},
	required = false,
	touched = false,
	type,
	value,
}) {
	const _renderInput = () => {
		if (name.slice(-5) === 'model') {
			return (
				<ModelAutocomplete
					label={label}
					name={name}
					onBlur={onBlur}
					onChange={onChange}
					required={required}
					value={value}
				/>
			);
		}

		switch (type) {
			case 'checkbox':
				return (
					<ClayCheckbox
						aria-label={label}
						checked={!!value}
						label={label}
						name={name}
						onBlur={onBlur}
						onChange={(event) => onChange(event.target.checked)}
						required={required}
						value={!!value}
					/>
				);
			case 'multiple':
				return (
					<MultiSelection
						items={items}
						name={name}
						onBlur={onBlur}
						onChange={onChange}
						required={required}
						value={value}
					/>
				);
			case 'number':
				return (
					<ClayInput
						id={name}
						max={options.max}
						min={options.min}
						name={name}
						onBlur={onBlur}
						onChange={(event) => onChange(event.target.value)}
						required={required}
						type="number"
						value={value}
					/>
				);
			case 'select':
				return (
					<ClaySelect
						aria-label={label}
						id={name}
						name={name}
						onBlur={onBlur}
						onChange={(event) => onChange(event.target.value)}
						required={required}
						value={value}
					>
						{items.map((item) => (
							<ClaySelect.Option
								key={item.key}
								label={item.label}
								value={item.key}
							/>
						))}
					</ClaySelect>
				);
			default:
				return (
					<ClayInput
						id={name}
						name={name}
						onBlur={onBlur}
						onChange={(event) => onChange(event.target.value)}
						required={required}
						type="text"
						value={value || ''}
					/>
				);
		}
	};

	return (
		<ClayForm.Group
			className={getCN({
				'has-error': error && touched,
			})}
		>
			{type !== 'checkbox' && (
				<label htmlFor={name}>
					{label}

					{required && (
						<span className="reference-mark">
							<ClayIcon symbol="asterisk" />
						</span>
					)}

					{helpText && (
						<ClayTooltipProvider>
							<span className="ml-2" title={helpText}>
								<ClayIcon symbol="question-circle-full" />
							</span>
						</ClayTooltipProvider>
					)}
				</label>
			)}

			{_renderInput()}

			{error && touched && (
				<ClayForm.FeedbackGroup>
					<ClayForm.FeedbackItem>{error}</ClayForm.FeedbackItem>
				</ClayForm.FeedbackGroup>
			)}

			{formText && (
				<ClayForm.FeedbackGroup>
					<ClayForm.Text>{formText}</ClayForm.Text>
				</ClayForm.FeedbackGroup>
			)}
		</ClayForm.Group>
	);
}

export default function ({
	assetEntryClassNames,
	availableAssetEntryClassNames,
	availableEmbeddingVectorDimensions,
	availableLanguageDisplayNames,
	availableSentenceTransformProviders,
	availableTextTruncationStrategies,
	cacheTimeout = '',
	embeddingVectorDimensions,
	enableGPU,
	enabled,
	huggingFaceAccessToken,
	languageIds,
	maxCharacterCount = '',
	model,
	modelTimeout = '',
	namespace = '',
	sentenceTransformProvider,
	textTruncationStrategy,
	txtaiHostAddress,
}) {
	const _handleFormikValidate = (values) => {
		const errors = {};

		if (
			!values.modelTimeout &&
			values.sentenceTransformProvider === 'huggingFace'
		) {
			errors.modelTimeout = Liferay.Language.get(
				'this-field-is-required'
			);
		}
		else {
			if (values.modelTimeout < 0) {
				errors.modelTimeout = sub(
					Liferay.Language.get(
						'please-enter-a-value-greater-than-or-equal-to-x'
					),
					['0']
				);
			}

			if (values.modelTimeout > 60) {
				errors.modelTimeout = sub(
					Liferay.Language.get(
						'please-enter-a-value-less-than-or-equal-to-x'
					),
					['60']
				);
			}
		}

		if (!values.maxCharacterCount) {
			errors.maxCharacterCount = Liferay.Language.get(
				'this-field-is-required'
			);
		}
		else {
			if (values.maxCharacterCount < 50) {
				errors.maxCharacterCount = sub(
					Liferay.Language.get(
						'please-enter-a-value-greater-than-or-equal-to-x'
					),
					['50']
				);
			}

			if (values.maxCharacterCount > 10000) {
				errors.maxCharacterCount = sub(
					Liferay.Language.get(
						'please-enter-a-value-less-than-or-equal-to-x'
					),
					['10000']
				);
			}
		}

		if (!values.assetEntryClassNames?.length) {
			errors.assetEntryClassNames = sub(
				Liferay.Language.get('the-x-field-is-required'),
				[Liferay.Language.get('asset-entry-class-names')]
			);
		}

		if (!values.languageIds?.length) {
			errors.languageIds = sub(
				Liferay.Language.get('the-x-field-is-required'),
				[Liferay.Language.get('language-ids')]
			);
		}

		if (!values.cacheTimeout) {
			errors.cacheTimeout = Liferay.Language.get(
				'this-field-is-required'
			);
		}
		else {
			if (values.cacheTimeout < 0) {
				errors.cacheTimeout = sub(
					Liferay.Language.get(
						'please-enter-a-value-greater-than-or-equal-to-x'
					),
					['0']
				);
			}
		}

		return errors;
	};

	const formik = useFormik({
		initialValues: {
			assetEntryClassNames,
			cacheTimeout,
			embeddingVectorDimensions,
			enableGPU,
			enabled,
			huggingFaceAccessToken,
			languageIds,
			maxCharacterCount,
			model,
			modelTimeout,
			sentenceTransformProvider,
			textTruncationStrategy,
			txtaiHostAddress,
		},
		validate: _handleFormikValidate,
	});

	const _handleBlur = (name) => () => formik.setFieldTouched(name);

	const _handleChange = (name) => (val) => formik.setFieldValue(name, val);

	return (
		<div className="semantic-search-settings">
			<Input
				label={Liferay.Language.get('enabled')}
				name={`${namespace}enabled`}
				onBlur={_handleBlur('enabled')}
				onChange={_handleChange('enabled')}
				type="checkbox"
				value={formik.values.enabled}
			/>

			<div className="sheet-section">
				<h3 className="sheet-subtitle">
					{Liferay.Language.get('transform-provider-settings')}
				</h3>

				<Input
					items={getEntries(availableSentenceTransformProviders)}
					label={Liferay.Language.get('sentence-transform-provider')}
					name={`${namespace}sentenceTransformProvider`}
					onBlur={_handleBlur('sentenceTransformProvider')}
					onChange={_handleChange('sentenceTransformProvider')}
					type="select"
					value={formik.values.sentenceTransformProvider}
				/>

				{formik.values.sentenceTransformProvider === 'txtai' && (
					<Input
						helpText={Liferay.Language.get(
							'sentence-transformer-txtai-host-address-help'
						)}
						label={Liferay.Language.get('txtai-host-address')}
						name={`${namespace}txtaiHostAddress`}
						onBlur={_handleBlur('txtaiHostAddress')}
						onChange={_handleChange('txtaiHostAddress')}
						value={formik.values.txtaiHostAddress}
					/>
				)}

				{formik.values.sentenceTransformProvider === 'huggingFace' && (
					<>
						<Input
							label={Liferay.Language.get(
								'hugging-face-access-token'
							)}
							name={`${namespace}huggingFaceAccessToken`}
							onBlur={_handleBlur('huggingFaceAccessToken')}
							onChange={_handleChange('huggingFaceAccessToken')}
							value={formik.values.huggingFaceAccessToken}
						/>

						<Input
							error={formik.errors.model}
							formText={Liferay.Language.get(
								'please-select-from-the-dropdown-list'
							)}
							helpText={Liferay.Language.get(
								'sentence-transformer-model-help'
							)}
							label={Liferay.Language.get('model')}
							name={`${namespace}model`}
							onBlur={_handleBlur('model')}
							onChange={_handleChange('model')}
							touched={formik.touched.model}
							value={formik.values.model}
						/>

						<Input
							error={formik.errors.modelTimeout}
							helpText={Liferay.Language.get(
								'sentence-transformer-model-timeout-help'
							)}
							label={Liferay.Language.get('model-timeout')}
							name={`${namespace}modelTimeout`}
							onBlur={_handleBlur('modelTimeout')}
							onChange={_handleChange('modelTimeout')}
							options={{max: 60, min: 0}}
							required={true}
							touched={formik.touched.modelTimeout}
							type="number"
							value={formik.values.modelTimeout}
						/>

						<Input
							label={Liferay.Language.get('enable-gpu')}
							name={`${namespace}enableGPU`}
							onBlur={_handleBlur('enableGPU')}
							onChange={_handleChange('enableGPU')}
							type="checkbox"
							value={formik.values.enableGPU}
						/>
					</>
				)}

				<Input
					aria-label={Liferay.Language.get(
						'embedding-vector-dimensions'
					)}
					items={getEntries(availableEmbeddingVectorDimensions)}
					label={Liferay.Language.get('embedding-vector-dimensions')}
					name={`${namespace}embeddingVectorDimensions`}
					onBlur={_handleBlur('embeddingVectorDimensions')}
					onChange={_handleChange('embeddingVectorDimensions')}
					type="select"
					value={formik.values.embeddingVectorDimensions}
				/>
			</div>

			<div className="sheet-section">
				<h3 className="sheet-subtitle">
					{Liferay.Language.get('indexing-settings')}
				</h3>

				<Input
					error={formik.errors.maxCharacterCount}
					helpText={Liferay.Language.get(
						'sentence-transformer-max-character-count-help'
					)}
					label={Liferay.Language.get('max-character-count')}
					name={`${namespace}maxCharacterCount`}
					onBlur={_handleBlur('maxCharacterCount')}
					onChange={_handleChange('maxCharacterCount')}
					options={{max: 10000, min: 50}}
					required={true}
					touched={formik.touched.maxCharacterCount}
					type="number"
					value={formik.values.maxCharacterCount}
				/>

				<Input
					helpText={Liferay.Language.get(
						'sentence-transformer-text-truncation-strategy-help'
					)}
					items={getEntries(availableTextTruncationStrategies)}
					label={Liferay.Language.get('text-truncation-strategy')}
					name={`${namespace}textTruncationStrategy`}
					onBlur={_handleBlur('textTruncationStrategy')}
					onChange={_handleChange('textTruncationStrategy')}
					type="select"
					value={formik.values.textTruncationStrategy}
				/>

				<Input
					error={formik.errors.assetEntryClassNames}
					helpText={Liferay.Language.get(
						'sentence-transformer-asset-entry-class-names-help'
					)}
					items={getEntries(availableAssetEntryClassNames)}
					label={Liferay.Language.get('asset-entry-class-names')}
					name={`${namespace}assetEntryClassNames`}
					onBlur={_handleBlur('assetEntryClassNames')}
					onChange={_handleChange('assetEntryClassNames')}
					required={true}
					touched={formik.touched.assetEntryClassNames}
					type="multiple"
					value={formik.values.assetEntryClassNames}
				/>

				<Input
					error={formik.errors.languageIds}
					helpText={Liferay.Language.get(
						'sentence-transformer-language-ids-help'
					)}
					items={getEntries(availableLanguageDisplayNames)}
					label={Liferay.Language.get('language-ids')}
					name={`${namespace}languageIds`}
					onBlur={_handleBlur('languageIds')}
					onChange={_handleChange('languageIds')}
					required={true}
					touched={formik.touched.languageIds}
					type="multiple"
					value={formik.values.languageIds}
				/>
			</div>

			<Input
				error={formik.errors.cacheTimeout}
				label={Liferay.Language.get('cache-timeout')}
				name={`${namespace}cacheTimeout`}
				onBlur={_handleBlur('cacheTimeout')}
				onChange={_handleChange('cacheTimeout')}
				options={{min: 0}}
				required={true}
				touched={formik.touched.cacheTimeout}
				type="number"
				value={formik.values.cacheTimeout}
			/>
		</div>
	);
}
