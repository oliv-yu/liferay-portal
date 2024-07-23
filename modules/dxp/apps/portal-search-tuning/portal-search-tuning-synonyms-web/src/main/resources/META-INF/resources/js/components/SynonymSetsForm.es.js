/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayDropDown from '@clayui/drop-down';
import ClayForm, {ClayInput} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import ClayLabel from '@clayui/label';
import ClayLayout from '@clayui/layout';
import ClayMultiSelect from '@clayui/multi-select';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

const ariaLabels = {
	default: Liferay.Language.get('default'),
	openLocalizations: Liferay.Language.get('open-localizations'),
	translated: Liferay.Language.get('translated'),
	untranslated: Liferay.Language.get('untranslated'),
};

const availableLocales = Object.keys(Liferay.Language.available)
	.sort((languageId) =>
		languageId === Liferay.ThemeDisplay.getDefaultLanguageId() ? -1 : 1
	)
	.map((language) => ({
		label: language.replace(/_/g, '-'),
		symbol: language.replace(/_/g, '-').toLowerCase(),
	}));

/**
 * Filters out empty items and duplicate items. Compares both label and value
 * properties.
 * @param {Array} list A list of label-value objects.
 */
function filterDuplicates(list) {
	const cleanedList = filterEmptyStrings(trimListItems(list));

	return cleanedList.filter(
		(item, index) =>
			cleanedList.findIndex(
				(newVal) =>
					newVal.label.toLowerCase() === item.label.toLowerCase() &&
					newVal.value.toLowerCase() === item.value.toLowerCase()
			) === index
	);
}

/**
 * Filters out empty strings from the passed in array.
 * @param {Array} list The list of strings to filter.
 * @returns {Array} The filtered list.
 */
function filterEmptyStrings(list) {
	return list.filter(({label, value}) => label && value);
}

/**
 * Trims whitespace in list items for ClayMultiSelect.
 * @param {Array} list A list of label-value objects.
 */
function trimListItems(list) {
	return list.map(({label, value}) => ({
		label: label.trim(),
		value: value.trim(),
	}));
}

class SynonymSetsForm extends Component {
	static propTypes = {
		formName: PropTypes.string.isRequired,
		inputName: PropTypes.string.isRequired,
		synonymSets: PropTypes.string,
		translatedSynonymSets: PropTypes.object,
	};

	static defaultProps = {
		synonymSets: '',
		translatedSynonymSets: {'en-US': ''},
	};

	state = {
		active: false,
		inputValue: '',
		selectedLocale: availableLocales[0],
		synonyms: [],
		translations: {
			'en-US': [],
		},
	};

	constructor(props) {
		super(props);

		const pendingTranslations = {};

		if (Object.keys(props.translatedSynonymSets || {}).length) {
			Object.entries(props.translatedSynonymSets).forEach(
				([locale, value]) => {
					pendingTranslations[locale] = value
						.split(',')
						.map((synonym) => ({
							label: synonym,
							value: synonym,
						}));
				}
			);
		}

		this.state.translations = pendingTranslations;
	}

	/*
	 * Any time the input is blurred, adds the current input value to the
	 * list of synonyms. This ensures that the user does not lose the value
	 * if they publish without hitting enter or comma.
	 */
	_handleBlur = () => {
		if (this.state.inputValue.trim()) {
			this.setState({
				translations: {
					...this.state.translations,
					[this.state.selectedLocale.label]: filterDuplicates([
						...this.state.translations[
							this.state.selectedLocale.label
						],
						{
							label: this.state.inputValue,
							value: this.state.inputValue,
						},
					]),
				},
			});
		}

		this.setState({inputValue: ''});
	};

	_handleCancel = () => {
		window.history.back();
	};

	_handleInputChange = (value) => {
		this.setState({inputValue: value});
	};

	_handleSubmit = (event) => {
		event.preventDefault();

		const form = document.forms[this.props.formName];

		const translationSet = {};

		Object.entries(this.state.translations).forEach(([locale, value]) => {
			translationSet[locale] = value.map(({label}) => label).join(',');
		});

		form.elements[this.props.inputName].value =
			JSON.stringify(translationSet);

		submitForm(form);
	};

	_handleItemsChange = (selectedLocaleLabel, values) => {
		this.setState({
			translations: {
				...this.state.translations,
				[selectedLocaleLabel]: filterDuplicates(values),
			},
		});
	};

	_handleActiveChange = (value) => {
		this.setState({active: value});
	};

	_handleSelectedLocaleChange = (locale) => {
		this.setState({selectedLocale: locale});
	};

	render() {
		const {active, inputValue, selectedLocale, translations} = this.state;

		const defaultLanguage = availableLocales[0];

		return (
			<div className="synonym-sets-form">
				<div className="sheet-title">
					{Liferay.Language.get('create-synonym-set')}
				</div>

				<div className="sheet-text">
					{Liferay.Language.get(
						'broaden-the-scope-of-search-by-treating-terms-equally-using-synonyms'
					)}
				</div>

				<ClayForm.Group>
					<label htmlFor="synonym-sets-input">
						{Liferay.Language.get('synonyms')}
					</label>

					<ClayInput.Group>
						<ClayInput.GroupItem>
							<ClayMultiSelect
								id="synonym-sets-input"
								items={translations[selectedLocale.label] || []}
								onBlur={this._handleBlur}
								onChange={this._handleInputChange}
								onItemsChange={(value) =>
									this._handleItemsChange(
										selectedLocale.label,
										value
									)
								}
								value={inputValue}
							/>

							<ClayForm.FeedbackGroup>
								<ClayForm.Text>
									{Liferay.Language.get(
										'type-a-comma-or-press-enter-to-input-a-synonym'
									)}
								</ClayForm.Text>
							</ClayForm.FeedbackGroup>
						</ClayInput.GroupItem>

						<ClayInput.GroupItem shrink>
							<ClayInput.GroupItem shrink>
								<ClayDropDown
									active={active}
									onActiveChange={this._handleActiveChange}
									trigger={
										<ClayButton
											displayType="secondary"
											monospaced
											onClick={() =>
												this._handleActiveChange(
													!active
												)
											}
											title={ariaLabels.openLocalizations}
										>
											<span className="inline-item">
												<ClayIcon
													symbol={
														selectedLocale.symbol
													}
												/>
											</span>

											<span className="btn-section">
												{selectedLocale.label}
											</span>
										</ClayButton>
									}
								>
									<ClayDropDown.ItemList>
										{availableLocales.map((locale) => {
											const value =
												translations[locale.label];

											return (
												<ClayDropDown.Item
													key={locale.label}
													onClick={() => {
														this._handleSelectedLocaleChange(
															locale
														);
													}}
												>
													<ClayLayout.ContentRow containerElement="span">
														<ClayLayout.ContentCol
															containerElement="span"
															expand
														>
															<ClayLayout.ContentSection>
																<ClayIcon
																	className="inline-item inline-item-before"
																	symbol={
																		locale.symbol
																	}
																/>

																{locale.label}
															</ClayLayout.ContentSection>
														</ClayLayout.ContentCol>

														<ClayLayout.ContentCol containerElement="span">
															<ClayLayout.ContentSection>
																<ClayLabel
																	displayType={
																		locale.label ===
																		defaultLanguage.label
																			? 'info'
																			: value
																				? 'success'
																				: 'warning'
																	}
																>
																	{locale.label ===
																	defaultLanguage.label
																		? ariaLabels.default
																		: value
																			? ariaLabels.translated
																			: ariaLabels.untranslated}
																</ClayLabel>
															</ClayLayout.ContentSection>
														</ClayLayout.ContentCol>
													</ClayLayout.ContentRow>
												</ClayDropDown.Item>
											);
										})}
									</ClayDropDown.ItemList>
								</ClayDropDown>
							</ClayInput.GroupItem>
						</ClayInput.GroupItem>
					</ClayInput.Group>
				</ClayForm.Group>

				<ClayLayout.SheetFooter>
					<ClayButton
						disabled={
							!translations[defaultLanguage.label]?.length &&
							!inputValue.trim()
						}
						displayType="primary"
						onClick={this._handleSubmit}
						type="submit"
					>
						{Liferay.Language.get('publish')}
					</ClayButton>

					<ClayButton
						displayType="secondary"
						onClick={this._handleCancel}
					>
						{Liferay.Language.get('cancel')}
					</ClayButton>
				</ClayLayout.SheetFooter>
			</div>
		);
	}
}

export default SynonymSetsForm;
