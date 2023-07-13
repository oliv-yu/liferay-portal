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
import getRecentContributor from './get_recent_contributor';

const PROPERTY_THRESHOLD = 'characterThreshold';

export default function ({
	federatedSearchKey,
	suggestionsContributorConfiguration,
}) {
	Liferay.on('allPortletsReady', () => {

		// Get contributor type "recent" threshold configuration.

		const characterThreshold = getRecentContributor(
			suggestionsContributorConfiguration
		)?.attributes?.characterThreshold;

		// If no contributors with name `CONTRIBUTOR_TYPES.RECENT_SEARCHES` is found, do nothing.
		// `threshold` is empty when no `CONTRIBUTOR_TYPES.RECENT_SEARCHES` is found.

		if (!characterThreshold) {
			return;
		}

		// eslint-disable-next-line
		if (federatedSearchKey == null || federatedSearchKey === '') {
			federatedSearchKey = 'default';
		}

		try {
			const recentSearchesObject = JSON.parse(
				sessionStorage.getItem(
					RECENT_SEARCHES_KEY,
					sessionStorage.TYPES.PERSONALIZATION
				)
			);

			// Set threshold configuration in local storage.

			sessionStorage.setItem(
				RECENT_SEARCHES_KEY,
				JSON.stringify({
					...recentSearchesObject,
					[federatedSearchKey]: {
						...(recentSearchesObject[federatedSearchKey] || {}),
						[PROPERTY_THRESHOLD]: characterThreshold,
					},
				}),
				sessionStorage.TYPES.PERSONALIZATION
			);
		}
		catch {

			// Assume there is no existing storage for `RECENT_SEARCHES_KEY`.

			sessionStorage.setItem(
				RECENT_SEARCHES_KEY,
				JSON.stringify({
					[federatedSearchKey]: {
						[PROPERTY_THRESHOLD]: characterThreshold,
					},
				}),
				sessionStorage.TYPES.PERSONALIZATION
			);
		}
	});
}
