/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {addParams, debounce, fetch} from 'frontend-js-web';

const Autocomplete = (
	searchInputId,
	{
		containerClass,
		destinationFriendlyURL,
		scopeIfDefined,
		suggestionsContributorConfiguration,
		suggestionsURL,
		showEmptyResultsMenu = true,
		templates = {},
	}
) => {
	const searchInput = document.getElementById(searchInputId);

	const form = searchInput.form;

	if (!searchInput && !form) {
		return;
	}

	const resetStartPage = form.querySelector('.search-bar-reset-start-page');
	const scopeSelect = form.querySelector('.search-bar-scope-select');

	const dropdownElement = document.createElement('div');
	const dropdownMenuElement = document.createElement('div');

	dropdownElement.classList.add('dropdown-wide');
	dropdownMenuElement.classList.add('dropdown-menu');

	dropdownElement.appendChild(dropdownMenuElement);

	if (containerClass) {
		dropdownElement.classList.add(containerClass);
	}

	if (!form.querySelector('.dropdown-menu')) {
		searchInput.parentElement.appendChild(dropdownElement);
	}

	const _fetchSuggestions = (searchValue) => {
		const serviceURL = new URL(
			Liferay.ThemeDisplay.getPathContext() + suggestionsURL,
			Liferay.ThemeDisplay.getPortalURL()
		);

		return fetch(
			addParams(
				{
					currentURL: window.location.href,
					destinationFriendlyURL: destinationFriendlyURL || '/search',
					groupId: Liferay.ThemeDisplay.getScopeGroupId(),
					keywordsParameterName: searchInput.name,
					plid: Liferay.ThemeDisplay.getPlid(),
					scope: scopeSelect ? scopeSelect.value : scopeIfDefined,
					search: searchValue,
				},
				serviceURL.href
			),
			{
				body: suggestionsContributorConfiguration,
				headers: new Headers({
					'Accept': 'application/json',
					'Accept-Language': Liferay.ThemeDisplay.getBCP47LanguageId(),
					'Content-Type': 'application/json',
				}),
				method: 'POST',
			}
		).then((response) => response.json());
	};

	const _handleClickShowMore = (event) => {
		event.preventDefault();
		event.stopPropagation();

		const searchURL = form.action;

		const queryString = _updateQueryString(document.location.search);

		document.location.href = searchURL + queryString;
	};

	const _handleClickOutside = (event) => {
		if (event.target !== searchInput && event.target !== dropdownElement) {
			dropdownMenuElement.classList.remove('show');
		}
	};

	const _handleInputChange = async (event) => {
		const searchInputValue = event.target.value;

		const searchInputValueTrimmed = searchInputValue.trim();

		if (searchInputValueTrimmed) {
			const resource = await _fetchSuggestions(searchInputValueTrimmed);

			if (!resource.items?.length) {
				if (showEmptyResultsMenu) {
					const renderEmptyResultsMenuFn =
						templates.renderEmptyResultsMenu ||
						_renderEmptyResultsMenu;

					dropdownMenuElement.innerHTML = renderEmptyResultsMenuFn();

					dropdownMenuElement.classList.add('show');
				}
				else {
					dropdownMenuElement.classList.remove('show');
				}
			}
			else {
				const renderMenuFn = templates.renderMenu || _renderMenu;

				dropdownMenuElement.innerHTML = renderMenuFn(resource, {
					onShowMore: _handleClickShowMore,
					renderHeader: templates.renderHeader || _renderHeader,
					renderItem: templates.renderItem || _renderItem,
					renderShowMore: templates.renderShowMore || _renderShowMore,
				});

				dropdownMenuElement.classList.add('show');
			}
		}
		else {
			dropdownMenuElement.classList.remove('show');
		}
	};

	const _renderEmptyResultsMenu = () => {
		return `<div class="dropdown-item">
			${Liferay.Language.get('no-results-were-found')}
		</div>`;
	};

	const _renderHeader = (group) => {
		return `<li class="dropdown-subheader">
			${group.displayGroupName}
		</li>`;
	};

	const _renderItem = (hit) => {
		return `<a class="dropdown-item" href="${hit.attributes.assetURL}">
				<div class="list-group-text text-dark">${hit.text}</div>
				<div class="list-group-text text-truncate text-2">
					${hit.attributes.assetSearchSummary}
				</div>
			</a>
		`;
	};

	const _renderMenu = (
		resource,
		{onShowMore, renderHeader, renderItem, renderShowMore}
	) => {
		return (
			resource.items
				?.map((group) => {
					return (
						renderHeader(group) +
						group.suggestions
							?.map((hit) => renderItem(hit))
							.join('')
					);
				})
				.join('') + renderShowMore(onShowMore)
		);
	};

	const _renderShowMore = (onShowMore) => {
		return `<button class="dropdown-item search-bar-suggestions-show-more" onClick="${onShowMore}">
			${Liferay.Language.get('show-more')}
		</button>`;
	};

	const _updateQueryString = (queryString) => {
		const searchParams = new URLSearchParams(queryString);

		if (searchInput.value) {
			searchParams.set(searchInput.name, searchInput.value.trim());
		}

		if (resetStartPage) {
			searchParams.delete(resetStartPage.name);
		}

		if (scopeSelect) {
			searchParams.set(scopeSelect.name, scopeSelect.value);
		}

		searchParams.delete('p_p_id');
		searchParams.delete('p_p_state');
		searchParams.delete('start');

		return '?' + searchParams.toString();
	};

	searchInput.addEventListener('input', debounce(_handleInputChange, 500));
	document.addEventListener('click', _handleClickOutside);

	return {
		dispose() {
			searchInput.removeEventListener(
				'input',
				debounce(_handleInputChange, 500)
			);
			document.removeEventListener('click', _handleClickOutside);
		},
	};
};

export default function () {
	Liferay.namespace('Search').Autocomplete = Autocomplete;

	Liferay.fire('liferaySearchAutocompleteReady');
}
