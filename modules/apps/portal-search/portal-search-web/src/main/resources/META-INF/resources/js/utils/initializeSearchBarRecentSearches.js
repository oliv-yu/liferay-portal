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

import {RECENT_SEARCHES_KEY, getRecentSearches} from './SearchBarUtil';

/**
 * Sets up the listener to save recent searches.
 * @param {string} context.federatedSearchKey Used for associating the keywords to which search bar.
 * @param {string} context.keywords The search query.
 * @param {number} context.resultThreshold Must at or above this count to save as a recent search.
 * @param {number} context.totalCount Used to compare with the resultThreshold.
 */
export default function initializeSearchBarRecentSearches({
	federatedSearchKey,
	keywords,
	resultThreshold = 1,
	totalCount,
}) {

	/**
	 * Stores recent searches in local storage with `RECENT_SEARCHES_KEY`.
	 *
	 * Example format of data.
	 * {
	 *   'q': ['3rd search term', '2nd search term', '1st search term']
	 * }
	 */
	Liferay.on('endNavigate', () => {
		if (keywords === '' && totalCount >= resultThreshold) {
			return;
		}

		// eslint-disable-next-line eqeqeq
		if (federatedSearchKey == null || federatedSearchKey === '') {
			federatedSearchKey = 'default';
		}

		try {
			const recentSearchesObject = JSON.parse(
				localStorage.getItem(RECENT_SEARCHES_KEY)
			);

			const existingRecentSearchesArray =
				recentSearchesObject[federatedSearchKey] || [];

			// If the stored most recent search is the same as the search just
			// made, there is no need to do anything further.

			if (existingRecentSearchesArray[0] === keywords) {
				return;
			}

			let newRecentSearchesArray = [
				keywords,
				...existingRecentSearchesArray,
			];

			// Remove duplicates using `Set` constructor.

			newRecentSearchesArray = [...new Set(newRecentSearchesArray)];

			// Filter blanks.

			newRecentSearchesArray = newRecentSearchesArray.filter(
				(keywords) => keywords.length
			);

			// Update the existing RECENT_SEARCHES_KEY value.

			localStorage.setItem(
				RECENT_SEARCHES_KEY,
				JSON.stringify({
					...recentSearchesObject,
					[federatedSearchKey]: newRecentSearchesArray,
				})
			);
		}
		catch {

			// Assume no existing RECENT_SEARCHES_KEY value. Create a new value.

			localStorage.setItem(
				RECENT_SEARCHES_KEY,
				JSON.stringify({
					[federatedSearchKey]: [keywords],
				})
			);
		}
	});

	const SearchBarUtil = {

		/**
		 * Gets the recent searches. Returns an empty array if nothing is found.
		 * @param {number} amount
		 * @returns {Array}
		 */
		getRecentSearches(amount) {
			return getRecentSearches(federatedSearchKey, amount);
		},
	};

	Liferay.Search.SearchBarUtil = SearchBarUtil;
}
