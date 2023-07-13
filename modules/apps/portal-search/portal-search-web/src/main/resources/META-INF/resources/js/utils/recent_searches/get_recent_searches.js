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

import {sessionStorage} from 'frontend-js-web';

import {RECENT_SEARCHES_KEY} from './constants';

/**
 * Gets the recent searches. Returns an empty array if nothing is found.
 * @param {number} amount
 * @returns {Array}
 */
export default function getRecentSearches(federatedSearchKey, amount = 5) {
	// eslint-disable-next-line
	if (federatedSearchKey == null || federatedSearchKey === '') {
		federatedSearchKey = 'default';
	}

	try {
		const recentSearchesObject = JSON.parse(
			sessionStorage.getItem(RECENT_SEARCHES_KEY)
		);

		const recentSearchesArray =
			recentSearchesObject[federatedSearchKey].items || [];

		// Trim results.

		return recentSearchesArray.slice(0, amount);
	}
	catch {
		return [];
	}
}
