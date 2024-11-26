/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import ClayToolbar from '@clayui/toolbar';
import getCN from 'classnames';
import {setNestedObjectValues, useFormik} from 'formik';
import {fetch, navigate} from 'frontend-js-web';
import {PropTypes} from 'prop-types';
import React, {useContext, useRef, useState} from 'react';

import useShouldConfirmBeforeNavigate from '../../hooks/useShouldConfirmBeforeNavigate';
import PageToolbar from '../../shared/PageToolbar';
import ThemeContext from '../../shared/ThemeContext';
import {DEFAULT_INDEX_CONFIGURATION} from '../../utils/constants';
import {DEFAULT_ERROR} from '../../utils/errorMessages';
import {DEFAULT_HEADERS} from '../../utils/fetch/fetch_data';
import fetchPreviewSearch from '../../utils/fetch/fetch_preview_search';
import getResultsError from '../../utils/functions/get_results_error';
import isDefined from '../../utils/functions/is_defined';
import traverseAndEncodeJSONStrings from '../../utils/functions/traverse_and_encode_json_strings';
import formatLocaleWithUnderscores from '../../utils/language/format_locale_with_underscores';
import renameKeys from '../../utils/language/rename_keys';
import {
	SIDEBAR_STATE,
	setStorageAddSXPElementSidebar,
} from '../../utils/sessionStorage';
import cleanUIConfiguration from '../../utils/sxp_element/clean_ui_configuration';
import isCustomJSONSXPElement from '../../utils/sxp_element/is_custom_json_sxp_element';
import parseCustomSXPElement from '../../utils/sxp_element/parse_custom_sxp_element';
import replaceTemplateVariable from '../../utils/sxp_element/replace_template_variable';
import transformToSearchContextAttributes from '../../utils/sxp_element/transform_to_search_context_attributes';
import transformToSearchPreviewHits from '../../utils/sxp_element/transform_to_search_preview_hits';
import {TEST_IDS} from '../../utils/testIds';
import {openErrorToast, setInitialSuccessToast} from '../../utils/toasts';
import {INPUT_TYPES} from '../../utils/types/inputTypes';
import {SIDEBAR_TYPES} from '../../utils/types/sidebarTypes';
import validateBoost from '../../utils/validation/validate_boost';
import validateJSON from '../../utils/validation/validate_json';
import validateNumberRange from '../../utils/validation/validate_number_range';
import validateRequired from '../../utils/validation/validate_required';
import PreviewSidebar from '../preview_sidebar/index';
import SelectedContent from '../query_builder_tab/SelectedContent';

const DEFAULT_LIST = [
	{
		className: 'com.liferay.journal.model.JournalArticle',
		id: '10',
		modifiedDate: 1712299736111,
		site: 'Liferay DXP',
		status: 'missing',
		title: 'Article 1',
		type: '',
	},
	{
		className: 'com.liferay.journal.model.JournalArticle',
		id: '11',
		modifiedDate: 1731299736011,
		site: 'Liferay DXP',
		status: 'deleted',
		title: 'Article 2',
		type: '',
	},
	{
		className: 'com.liferay.journal.model.JournalArticle',
		id: '12',
		modifiedDate: 1732199736011,
		site: 'Liferay DXP',
		status: 'deleted',
		title: 'Article 3',
		type: '',
	},
	{
		className: 'com.liferay.journal.model.JournalArticle',
		id: '13',
		modifiedDate: 1732289736011,
		site: 'Liferay DXP',
		status: 'missing',
		title: 'Article 4',
		type: '',
	},
];

function ManualSXPForm({
	initialConfiguration = {},
	initialDescription = '',
	initialDescriptionI18n = {},
	initialExternalReferenceCode,
	initialSXPElementInstances = [],
	initialTitle = '',
	initialTitleI18n = {},
	sxpBlueprintId,
}) {
	const {redirectURL} = useContext(ThemeContext);

	const formRef = useRef();

	const controllerRef = useRef();

	const [isTitleAndDescriptionEdited, setIsTitleAndDescriptionEdited] =
		useState(false);
	const [previewInfo, setPreviewInfo] = useState(() => ({
		loading: false,
		results: {},
	}));
	const [openSidebar, setOpenSidebar] = useState('');
	const [manualList, setManualList] = useState(DEFAULT_LIST);

	/**
	 * This method must go before the useFormik hook.
	 */
	const _handleFormikSubmit = async (values) => {
		let configuration;
		let elementInstances;

		try {
			configuration = _getConfiguration(values);
			elementInstances = _getElementInstances(values);
		}
		catch (error) {
			openErrorToast({
				message: Liferay.Language.get(
					'the-configuration-has-missing-or-invalid-values'
				),
			});

			if (process.env.NODE_ENV === 'development') {
				console.error(error);
			}

			return;
		}

		try {
			const responseContent = await fetch(
				`/o/search-experiences-rest/v1.0/sxp-blueprints/${sxpBlueprintId}`,
				{
					body: JSON.stringify({
						configuration,
						description_i18n: renameKeys(
							formik.values.description_i18n,
							formatLocaleWithUnderscores
						),
						elementInstances,
						externalReferenceCode:
							formik.values.externalReferenceCode,
						title_i18n: renameKeys(
							formik.values.title_i18n,
							formatLocaleWithUnderscores
						),
					}),
					headers: DEFAULT_HEADERS,
					method: 'PUT',
				}
			).then((response) => {
				if (!response.ok) {
					openErrorToast();

					throw DEFAULT_ERROR;
				}

				return response.json();
			});

			if (
				Object.prototype.hasOwnProperty.call(responseContent, 'errors')
			) {
				responseContent.errors.forEach((message) =>
					openErrorToast({message})
				);
			}
			else {
				setInitialSuccessToast(
					Liferay.Language.get('the-blueprint-was-saved-successfully')
				);

				navigate(redirectURL);
			}
		}
		catch (error) {
			openErrorToast();

			if (process.env.NODE_ENV === 'development') {
				console.error(error);
			}
		}
	};

	/**
	 * This method must go before the useFormik hook.
	 */
	const _handleFormikValidate = (values) => {
		const errors = {};

		// Validate the elements added to the query builder

		const elementInstancesArray = [];

		values.elementInstances.map(
			({sxpElement, uiConfigurationValues}, index) => {
				const enabled =
					sxpElement.elementDefinition?.configuration
						?.queryConfiguration?.queryEntries?.[0]?.enabled;
				const uiConfiguration =
					sxpElement.elementDefinition?.uiConfiguration;

				if (isDefined(enabled) && !enabled) {
					return;
				}

				const configErrors = {};
				const fieldSets =
					cleanUIConfiguration(uiConfiguration).fieldSets;

				if (
					!!fieldSets.length &&
					!isCustomJSONSXPElement(uiConfigurationValues)
				) {
					fieldSets.map(({fields}) => {
						fields.map(({name, type, typeOptions = {}}) => {
							const configValue = uiConfigurationValues[name];

							const configError =
								validateRequired(
									configValue,
									name,
									typeOptions.nullable,
									typeOptions.required,
									type
								) ||
								validateBoost(configValue, type) ||
								validateNumberRange(
									configValue,
									type,
									typeOptions
								) ||
								validateJSON(configValue, type);

							if (configError) {
								configErrors[name] = configError;
							}
						});
					});
				}
				else if (isCustomJSONSXPElement(uiConfigurationValues)) {
					const configValue = uiConfigurationValues?.sxpElement;

					const configError =
						validateRequired(
							configValue,
							'',
							false,
							true,
							INPUT_TYPES.JSON
						) || validateJSON(configValue, INPUT_TYPES.JSON);

					if (configError) {
						configErrors.sxpElement = configError;
					}
				}

				if (Object.keys(configErrors).length) {
					elementInstancesArray[index] = {
						uiConfigurationValues: configErrors,
					};
				}
			}
		);

		if (elementInstancesArray.length) {
			errors.elementInstances = elementInstancesArray;
		}

		// Validate all JSON inputs on the configuration tab

		[
			'advancedConfig',
			'aggregationConfig',
			'highlightConfig',
			'parameterConfig',
			'sortConfig',
		].map((configName) => {
			const configError = validateJSON(
				values[configName],
				INPUT_TYPES.JSON
			);

			if (configError) {
				errors[configName] = configError;
			}
		});

		return errors;
	};

	const formik = useFormik({
		initialValues: {
			advancedConfig: JSON.stringify(
				initialConfiguration.advancedConfiguration,
				null,
				'\t'
			),
			aggregationConfig: JSON.stringify(
				initialConfiguration.aggregationConfiguration,
				null,
				'\t'
			),
			applyIndexerClauses:
				initialConfiguration.queryConfiguration?.applyIndexerClauses,
			description_i18n: initialDescriptionI18n,
			elementInstances: initialSXPElementInstances.map(
				(elementInstance, index) => ({
					...elementInstance,
					id: index,
				})
			),
			externalReferenceCode: initialExternalReferenceCode,
			frameworkConfig: initialConfiguration.generalConfiguration || {
				clauseContributorsExcludes: [],
				clauseContributorsIncludes: [],
			},
			highlightConfig: JSON.stringify(
				initialConfiguration.highlightConfiguration,
				null,
				'\t'
			),
			indexConfig:
				initialConfiguration.indexConfiguration ||
				DEFAULT_INDEX_CONFIGURATION,
			parameterConfig: JSON.stringify(
				initialConfiguration.parameterConfiguration,
				null,
				'\t'
			),
			sortConfig: JSON.stringify(
				initialConfiguration.sortConfiguration,
				null,
				'\t'
			),
			title_i18n: initialTitleI18n,
		},
		onSubmit: _handleFormikSubmit,
		validate: _handleFormikValidate,
	});

	useShouldConfirmBeforeNavigate(formik.dirty && !formik.isSubmitting);

	/**
	 * Formats the form values for the "configuration" parameter to send to
	 * the server. Sets defaults so the JSON.parse calls don't break.
	 * @param {Object} values Form values
	 * @return {Object}
	 */
	const _getConfiguration = ({
		advancedConfig,
		aggregationConfig,
		applyIndexerClauses,
		frameworkConfig,
		highlightConfig,
		indexConfig,
		parameterConfig,
		sortConfig,
	}) => {
		const configuration = {
			advancedConfiguration: advancedConfig
				? JSON.parse(advancedConfig)
				: {},
			aggregationConfiguration: aggregationConfig
				? JSON.parse(aggregationConfig)
				: {},
			generalConfiguration: frameworkConfig,
			highlightConfiguration: highlightConfig
				? JSON.parse(highlightConfig)
				: {},
			parameterConfiguration: parameterConfig
				? JSON.parse(parameterConfig)
				: {},
			queryConfiguration: {
				applyIndexerClauses,
			},
			sortConfiguration: sortConfig ? JSON.parse(sortConfig) : {},
		};

		if (Liferay.FeatureFlags['LPS-153813']) {
			configuration.indexConfiguration =
				indexConfig || DEFAULT_INDEX_CONFIGURATION;
		}

		return configuration;
	};

	const _getElementInstances = (values) =>
		values.elementInstances.map(
			({
				id, // eslint-disable-line
				sxpElement,
				sxpElementId,
				type,
				uiConfigurationValues,
			}) => {
				const parsedSXPElement = parseCustomSXPElement(
					sxpElement,
					uiConfigurationValues
				);

				const encodedElementDefinition = traverseAndEncodeJSONStrings(
					parsedSXPElement.elementDefinition || {}
				);

				return {
					configurationEntry: replaceTemplateVariable({
						sxpElement,
						uiConfigurationValues,
					}),
					sxpElement: {
						...parsedSXPElement,
						elementDefinition: encodedElementDefinition,
					},
					sxpElementId,
					type,
					uiConfigurationValues,
				};
			}
		);

	const _handleExternalReferenceCodeChange = (externalReferenceCode) => {
		formik.setFieldValue('externalReferenceCode', externalReferenceCode);
	};

	/**
	 * Used by the preview sidebar to cancel any unexpectedly slow search.
	 */
	const _handleFetchPreviewCancel = () => {
		controllerRef.current.abort();
	};

	/**
	 * Used by the preview sidebar to perform searches.
	 * @param {string} query The keyword search query
	 * @param {number} delta The number of results to return
	 * @param {number} page The page to return
	 * @param {Array} attributes The search context attributes
	 */
	const _handleFetchPreviewSearch = async (
		query,
		delta,
		page,
		attributes
	) => {
		controllerRef.current = new AbortController();

		setPreviewInfo((previewInfo) => ({
			...previewInfo,
			loading: true,
		}));

		let configuration;
		let elementInstances;

		try {
			configuration = _getConfiguration(formik.values);
			elementInstances = _getElementInstances(formik.values);

			// Touch inputs with errors to show validation errors.

			const errors = await formik.validateForm();

			formik.setTouched(setNestedObjectValues(errors, true));

			// Don't perform a search if there are missing required fields.

			if (!formik.isValid) {
				throw Liferay.Language.get(
					'the-configuration-has-missing-or-invalid-values'
				);
			}
		}
		catch (error) {

			// Add a delay so the loading indicator is visible before showing
			// the error message. This provides feedback that a new search has
			// been made.

			setTimeout(() => {
				setPreviewInfo({
					loading: false,
					results: {
						errors: [
							{
								msg: Liferay.Language.get(
									'the-configuration-has-missing-or-invalid-values'
								),
							},
						],
					},
				});
			}, 100);

			if (process.env.NODE_ENV === 'development') {
				console.error(error);
			}

			return;
		}

		const parseResponseContent = (responseContent) => {
			const exceptionKey = 'java.lang.RuntimeException';

			if (
				responseContent.searchHits?.totalHits > 0 ||
				!responseContent.responseString?.startsWith(exceptionKey)
			) {
				return responseContent;
			}

			let exceptionClass;

			const exceptionKeyIndex = responseContent.responseString.indexOf(
				':',
				exceptionKey.length + 1
			);

			if (exceptionKeyIndex !== -1) {
				exceptionClass = responseContent.responseString.substring(
					exceptionKey.length + 1,
					exceptionKeyIndex
				);
			}

			let msg;

			const errorObjectIndex =
				responseContent.responseString.indexOf('{"error":{');

			if (errorObjectIndex > 0) {
				const errorJSONObject = JSON.parse(
					responseContent.responseString.substring(errorObjectIndex)
				);

				msg = errorJSONObject.error.root_cause[0]?.reason;
			}

			return getResultsError({
				exceptionClass,
				exceptionTrace: responseContent.responseString,
				msg,
			});
		};

		return fetchPreviewSearch(
			{
				page,
				pageSize: delta,
				query,
			},
			{
				body: JSON.stringify({
					configuration: {
						...configuration,
						generalConfiguration: {
							...configuration?.generalConfiguration,
							emptySearchEnabled: true,
							explain: true,
							includeResponseString: true,
							languageId: Liferay.ThemeDisplay.getLanguageId(),
						},
						searchContextAttributes:
							transformToSearchContextAttributes(attributes),
					},
					elementInstances,
				}),
				signal: controllerRef.current.signal,
			}
		)
			.then((response) => {
				return response.json().then((data) => ({
					ok: response.ok,
					responseContent: data,
				}));
			})
			.then(({ok, responseContent}) => {
				setPreviewInfo({
					loading: false,
					results: parseResponseContent(
						ok
							? responseContent
							: getResultsError({
									msg: responseContent?.title,
								})
					),
				});
			})
			.catch((error) => {
				setPreviewInfo({
					loading: false,
					results:
						error.name === 'AbortError'
							? previewInfo.results
							: getResultsError({}),
				});
			});
	};

	const _handleFocusSXPElement = (prefixedId) => {
		const sxpElement = document.getElementById(prefixedId);

		if (sxpElement) {
			window.scrollTo({
				behavior: 'smooth',
				top:
					sxpElement.getBoundingClientRect().top +
					window.pageYOffset -
					55 - // Control menu height
					104 - // Page toolbar height
					20, // Additional padding
			});

			sxpElement.classList.remove('focus');

			void sxpElement.offsetWidth; // Triggers reflow to restart animation

			sxpElement.classList.add('focus');
		}
	};

	const _handleSidebarClose = () => {
		setOpenSidebar('');
	};

	const _handleSubmit = (event) => {
		event.preventDefault();

		formik.handleSubmit();

		if (!formik.isValid) {
			openErrorToast({
				message: Liferay.Language.get(
					'unable-to-save-due-to-invalid-or-missing-configuration-values'
				),
			});
		}
	};

	const _handleTitleAndDescriptionChange = ({
		description_i18n,
		title_i18n,
	}) => {
		formik.setFieldValue('description_i18n', description_i18n);
		formik.setFieldValue('title_i18n', title_i18n);

		setIsTitleAndDescriptionEdited(true);
	};

	const _handleToggleSidebar = (type) => () => {
		if (type === SIDEBAR_TYPES.PREVIEW) {
			setStorageAddSXPElementSidebar(SIDEBAR_STATE.CLOSED);
		}

		setOpenSidebar(openSidebar === type ? '' : type);
	};

	return (
		<form className="manual-sxp-form-root" ref={formRef}>
			<PageToolbar
				description={initialDescription}
				descriptionI18n={formik.values.description_i18n}
				entityId={sxpBlueprintId}
				externalReferenceCode={formik.values.externalReferenceCode}
				isSubmitting={formik.isSubmitting}
				onCancel={redirectURL}
				onExternalReferenceCodeChange={
					_handleExternalReferenceCodeChange
				}
				onSubmit={_handleSubmit}
				onTitleAndDescriptionChange={_handleTitleAndDescriptionChange}
				title={initialTitle}
				titleAndDescriptionEdited={isTitleAndDescriptionEdited}
				titleI18n={formik.values.title_i18n}
			>
				<ClayToolbar.Item>
					<ClayButton
						className={getCN('link-outline-secondary', {
							active: openSidebar === SIDEBAR_TYPES.PREVIEW,
						})}
						data-qa-id={TEST_IDS.PREVIEW_SIDEBAR_BUTTON}
						displayType="secondary"
						onClick={_handleToggleSidebar(SIDEBAR_TYPES.PREVIEW)}
						size="sm"
					>
						<ClayIcon className="c-mr-2" symbol="view" />

						{Liferay.Language.get('test-your-query')}
					</ClayButton>
				</ClayToolbar.Item>
			</PageToolbar>

			<PreviewSidebar
				errors={previewInfo.results.errors}
				hits={transformToSearchPreviewHits(previewInfo.results)}
				loading={previewInfo.loading}
				onClose={_handleSidebarClose}
				onFetchCancel={_handleFetchPreviewCancel}
				onFetchResults={_handleFetchPreviewSearch}
				onFocusSXPElement={_handleFocusSXPElement}
				requestString={previewInfo.results.requestString}
				responseString={previewInfo.results.responseString}
				totalHits={previewInfo.results.searchHits?.totalHits}
				visible={openSidebar === SIDEBAR_TYPES.PREVIEW}
			/>

			<div
				className={getCN({
					'open-preview': openSidebar === SIDEBAR_TYPES.PREVIEW,
				})}
			>
				<SelectedContent
					content={manualList}
					onChangeContent={setManualList}
				/>
			</div>
		</form>
	);
}

ManualSXPForm.propTypes = {
	initialConfiguration: PropTypes.object,
	initialDescription: PropTypes.string,
	initialDescriptionI18n: PropTypes.object,
	initialSXPElementInstances: PropTypes.arrayOf(PropTypes.object),
	initialTitle: PropTypes.string,
	initialTitleI18n: PropTypes.object,
	sxpBlueprintExternalReferenceCode: PropTypes.string,
	sxpBlueprintId: PropTypes.string,
};

export default React.memo(ManualSXPForm);
