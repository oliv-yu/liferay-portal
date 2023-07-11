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

import {RECENT_SEARCHES_KEY} from './SearchBarUtil';
import {CONTRIBUTOR_TYPES} from './types/contributorTypes';

const PROPERTY_THRESHOLD = 'threshold';

/**
 * Finds a suggestion contributor with the contributorName CONTRIBUTOR_TYPES.RECENT_SEARCHES
 * and gets the set threshold configuration.
 * @param {string} suggestionsContributorConfiguration
 * @returns {number}
 */
function getThresholdConfiguration(suggestionsContributorConfiguration) {
	try {
		const suggestionsContributorConfigurationArray = JSON.parse(
			suggestionsContributorConfiguration
		);

		// TODO: Figure out why recent contributor is never found
		// debugger;

		const indexOfRecentContributor = suggestionsContributorConfigurationArray.indexOf(
			(contributor) => {

				// console.log(contributor.contributorName);

				return (
					contributor.contributorName ===
					CONTRIBUTOR_TYPES.RECENT_SEARCHES
				);
			}
		);

		if (indexOfRecentContributor === -1) {
			throw `Unable to find a contributor with name ${CONTRIBUTOR_TYPES.RECENT_SEARCHES}`;
		}

		return suggestionsContributorConfigurationArray[
			indexOfRecentContributor
		].attributes?.threshold;
	}
	catch (error) {
		if (process.env.NODE_ENV === 'development') {
			/* eslint-disable-next-line no-console */
			console.info(error);
		}

		return -1;
	}
}

export default function ({
	federatedSearchKey,
	suggestionsContributorConfiguration,
}) {
	Liferay.on('allPortletsReady', () => {

		// Get contributor type "recent" threshold configuration.

		const threshold = getThresholdConfiguration(
			suggestionsContributorConfiguration
		);

		// If no contributors with name `CONTRIBUTOR_TYPES.RECENT_SEARCHES` is found, do nothing.
		// `threshold` is -1 when no `CONTRIBUTOR_TYPES.RECENT_SEARCHES` is found.

		if (threshold === -1) {
			return;
		}

		try {
			const recentSearchesObject = JSON.parse(
				Liferay.Util.LocalStorage.getItem(
					RECENT_SEARCHES_KEY,
					Liferay.Util.LocalStorage.TYPES.PERSONALIZATION
				)
			);

			// Set threshold configuration in local storage.

			Liferay.Util.LocalStorage.setItem(
				RECENT_SEARCHES_KEY,
				{
					...recentSearchesObject,
					[federatedSearchKey]: {
						...(recentSearchesObject[federatedSearchKey] || {}),
						[PROPERTY_THRESHOLD]: threshold,
					},
				},
				Liferay.Util.LocalStorage.TYPES.PERSONALIZATION
			);
		}
		catch {

			// Assume there is no existing storage for `RECENT_SEARCHES_KEY`.

			Liferay.Util.LocalStorage.setItem(
				RECENT_SEARCHES_KEY,
				{
					[federatedSearchKey]: {
						[PROPERTY_THRESHOLD]: threshold,
					},
				},
				Liferay.Util.LocalStorage.TYPES.PERSONALIZATION
			);
		}
	});
}
