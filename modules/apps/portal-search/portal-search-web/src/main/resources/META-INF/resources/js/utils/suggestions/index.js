/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import {addParams, debounce, fetch} from 'frontend-js-web';

import cleanSuggestionsContributorConfiguration from '../clean_suggestions_contributor_configuration';

class SuggestionsHandler {
	constructor(context) {
		const {
			destinationFriendlyURL,
			emptySearchEnabled,
			isDXP,
			isSearchExperiencesSupported,
			keywordsParameterName,
			letUserChooseScope,
			namespace,
			paginationStartParameterName,
			scopeParameterName,
			scopeParameterStringCurrentSite,
			scopeParameterStringEverything,
			searchURL,
			selectedEverythingSearchScope,
			suggestionsContributorConfiguration,
			suggestionsURL,
		} = context;

		this.namespace = namespace;
		this.destinationFriendlyURL = destinationFriendlyURL;
		this.keywordsParameterName = keywordsParameterName;
		this.emptySearchEnabled = emptySearchEnabled;
		this.fetchSuggestionsURL = new URL(
			`${Liferay.ThemeDisplay.getPathContext()}${suggestionsURL}`,
			Liferay.ThemeDisplay.getPortalURL()
		);
		this.letUserChooseScope = letUserChooseScope;
		this.paginationStartParameterName = paginationStartParameterName;
		this.scopeParameterName = scopeParameterName;
		this.selectedEverythingSearchScope = selectedEverythingSearchScope;
		this.scopeParameterStringCurrentSite = scopeParameterStringCurrentSite;
		this.scopeParameterStringEverything = scopeParameterStringEverything;
		this.searchURL = searchURL;

		this.suggestionsContributorConfiguration = JSON.stringify(
			cleanSuggestionsContributorConfiguration(
				suggestionsContributorConfiguration,
				isDXP,
				isSearchExperiencesSupported
			)
		);

		this.initialize = this.initialize.bind(this);
		this.fetchSuggestions = this.fetchSuggestions.bind(this);
		this._handleKeywordsInputChange = this._handleKeywordsInputChange.bind(
			this
		);
		this._renderSuggestionGroups = this._renderSuggestionGroups.bind(this);
		this._renderSuggestionGroupItems = this._renderSuggestionGroupItems.bind(
			this
		);
		this._handleClickOutside = this._handleClickOutside.bind(this);
		this._updateQueryString = this._updateQueryString.bind(this);
	}

	/**
	 * Initializes the event listeners to display the suggestions typing in
	 * the specified input.
	 * @param {number} _.debounceDelay The delay when finished typing to do
	 * 	another fetch.
	 * @param {string} _.keywordsInputId The search input.
	 * @param {function} _.renderSuggestions How the suggestions will be
	 * 	displayed. This will be parsed into HTML.
	 * @param {string} _.suggestionsContainerId Where the `renderSuggestions`
	 * 	function will render the suggestions.
	 */
	initialize({
		debounceDelay = 500,
		keywordsInputId,
		onLoadingEnd,
		onLoadingStart,
		renderSuggestions,
		scopeSelectId,
		suggestionsContainerId,
	}) {
		this.keywordsInputElement = document.getElementById(
			keywordsInputId || `${this.namespace}keywords-input`
		);
		this.scopeSelectElement = document.getElementById(
			scopeSelectId || `${this.namespace}scope-select`
		);
		this.suggestionsContainerElement = document.getElementById(
			suggestionsContainerId || `${this.namespace}suggestions`
		);

		this.onLoadingEnd = onLoadingEnd;
		this.onLoadingStart = onLoadingStart;
		this.renderSuggestions =
			renderSuggestions || this._renderSuggestionGroups;

		this.scope = this.selectedEverythingSearchScope
			? this.scopeParameterStringEverything
			: this.scopeParameterStringCurrentSite;

		// Check for required elements.

		const requiredElements = [
			{
				element: this.keywordsInputElement,
				id: keywordsInputId || `${this.namespace}keywords-input`,
			},
			{
				element: this.suggestionsContainerElement,
				id: suggestionsContainerId || `${this.namespace}suggestions`,
			},
		];

		// Log any missing elements and do not proceed with the rest of the
		// function.

		requiredElements.forEach((element) => {
			if (!element.element) {
				console.error('Unable to find element with ID:', element.id);
			}
		});

		if (requiredElements.some((element) => !element.element)) {
			console.error('Unable to initialize suggestions.');

			return;
		}

		// Attach event listeners.

		const handleKeywordsInputChangeDebounced = debounce(
			(event) => this._handleKeywordsInputChange(event),
			debounceDelay
		);

		this.keywordsInputElement.addEventListener(
			'input',
			handleKeywordsInputChangeDebounced
		);

		document.body.addEventListener('click', this._handleClickOutside);

		// Cleanup event handlers.

		Liferay.on('beforeNavigate', () => {
			this.keywordsInputElement.removeEventListener(
				'input',
				handleKeywordsInputChangeDebounced
			);

			document.body.removeEventListener(
				'click',
				this._handleClickOutside
			);
		});
	}

	/**
	 * Gets suggestions with the specified keyword and scope.
	 * @param {string} keyword The search query.
	 * @param {string} scope The search scope. Value must be either:
	 * 	- this.scopeParameterStringCurrentSite
	 * 	(in JSP use: searchBarPortletDisplayContext.getCurrentSiteSearchScopeParameterString())
	 * 	- this.scopeParameterStringEverything
	 * 	(in JSP use: searchBarPortletDisplayContext.getEverythingSearchScopeParameterString())
	 * @returns {Promise}
	 */
	fetchSuggestions(keyword, scope = this.scopeParameterStringCurrentSite) {
		return fetch(
			addParams(
				{
					currentURL: window.location.href,
					destinationFriendlyURL: this.destinationFriendlyURL.trim()
						.length
						? this.destinationFriendlyURL
						: '/search',
					groupId: Liferay.ThemeDisplay.getScopeGroupId(),
					keywordsParameterName: this.keywordsParameterName,
					plid: Liferay.ThemeDisplay.getPlid(),
					scope,
					search: keyword,
				},
				this.fetchSuggestionsURL.href
			),
			{
				body: this.suggestionsContributorConfiguration,
				headers: new Headers({
					'Accept': 'application/json',
					'Accept-Language': Liferay.ThemeDisplay.getBCP47LanguageId(),
					'Content-Type': 'application/json',
				}),
				method: 'POST',
			}
		).then((response) => response.json());
	}

	_handleClickOutside(event) {
		if (
			this.suggestionsContainerElement?.classList?.contains('show') &&
			!this.keywordsInputElement.contains(event.target) &&
			!this.suggestionsContainerElement.contains(event.target)
		) {
			this.suggestionsContainerElement.classList.remove('show');
		}
	}

	_handleKeywordsInputChange(event) {
		const inputValue = event.target.value;

		if (typeof this.onLoadingStart === 'function') {
			this.onLoadingStart();
		}

		const scope = this.scopeSelectElement
			? this.scopeSelectElement.value
			: this.scope;

		this.fetchSuggestions(inputValue, scope)
			.then((data) => {
				if (data?.items.length) {
					this.suggestionsContainerElement.classList.add('show');

					const searchURL =
						this.searchURL +
						this._updateQueryString(
							document.location.search,
							inputValue
						);

					this.suggestionsContainerElement.innerHTML = this.renderSuggestions(
						data?.items,
						searchURL
					);
				}
				else {
					this.suggestionsContainerElement.classList.remove('show');
				}
			})
			.finally(() => {
				if (typeof this.onLoadingEnd === 'function') {
					this.onLoadingEnd();
				}
			});
	}

	_renderSuggestionGroups(suggestionGroups, searchURL) {
		return (
			suggestionGroups
				.map(
					(suggestionGroup) =>
						`<li class="dropdown-subheader">
						${Liferay.Util.escapeHTML(suggestionGroup.displayGroupName)}
					</li>
					<ul class="list-unstyled search-bar-suggestions-results-list">
						${this._renderSuggestionGroupItems(suggestionGroup.suggestions)}
					</ul>`
				)
				.join('') +
			`<ul class="list-unstyled">
				<li>
					<a class="dropdown-item search-bar-suggestions-show-more" href="${searchURL}">
						${Liferay.Language.get('see-more')}
					</a>
				</li>
			</ul>`
		);
	}

	_renderSuggestionGroupItems(suggestionGroupItems) {
		return suggestionGroupItems
			.map(
				(suggestion) =>
					`<li>
						<a class="dropdown-item" href="${suggestion.attributes.assetURL}">
							<div class="suggestion-item-title">
								${Liferay.Util.escapeHTML(suggestion.text)}
							</div>

							${
								suggestion.attributes.assetSearchSummary &&
								`<div class="suggestion-item-description">
								<div class="text-truncate-inline">
									<div class="text-truncate">
										${Liferay.Util.escapeHTML(suggestion.attributes.assetSearchSummary)}
									</div>
								</div>
							</div>`
							}
						</a>
					</li>`
			)
			.join('');
	}

	_updateQueryString(queryString, inputValue) {
		const searchParams = new URLSearchParams(queryString);

		if (this.emptySearchEnabled || inputValue) {
			searchParams.set(
				this.keywordsParameterName,
				inputValue.replace(/^\s+|\s+$/, '')
			);
		}

		if (this.paginationStartParameterName) {
			searchParams.delete(this.paginationStartParameterName);
		}

		if (this.letUserChooseScope && this.scopeSelectElement) {
			searchParams.set(
				this.scopeParameterName,
				this.scope || this.scopeParameterStringCurrentSite
			);
		}

		searchParams.delete('p_p_id');
		searchParams.delete('p_p_state');
		searchParams.delete('start');

		return '?' + searchParams.toString();
	}
}

function initializeSuggestionsHandler(context) {
	const {namespace} = context;

	console.log('init', namespace); //eslint-disable-line

	if (namespace) {

		// Initialize the SuggestionsHandler to the object path:
		// `Liferay.Search.Suggestions[namespace]`.
		//
		// `Liferay.namespace` helps to create any properties that don't exist.

		Liferay.namespace('Search.Suggestions')[
			namespace
		] = new SuggestionsHandler(context);
	}
}

export default initializeSuggestionsHandler;
