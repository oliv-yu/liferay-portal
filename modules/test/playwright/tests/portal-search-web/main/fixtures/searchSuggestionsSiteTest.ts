/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../../fixtures/dataApiHelpersTest';
import {isolatedSiteTest} from '../../../../fixtures/isolatedSiteTest';
import {searchPageTest} from '../../../../fixtures/searchPageTest';
import getRandomString from '../../../../utils/getRandomString';
import getBasicWebContentStructureId from '../../../../utils/structured-content/getBasicWebContentStructureId';

export interface SearchSuggestionsSite {

	/**
	 * A search page other than the origin, used as an explicit destination
	 */
	destinationLayout: Layout;

	/**
	 * The search page the suggestions are typed on
	 */
	originLayout: Layout;

	/**
	 * Title of the web content article the suggestions resolve to
	 */
	title: string;
}

const test = mergeTests(dataApiHelpersTest, isolatedSiteTest, searchPageTest);

const searchSuggestionsSiteTest = test.extend<{
	searchSuggestionsSite: SearchSuggestionsSite;
}>({
	searchSuggestionsSite: async (
		{apiHelpers, page, searchPage, site},
		use
	) => {
		const title = getRandomString();

		await apiHelpers.jsonWebServicesJournal.addWebContent({
			ddmStructureId: await getBasicWebContentStructureId(apiHelpers),
			groupId: site.id,
			titleMap: {en_US: title},
		});

		const addLayout = (layoutTitle: string = getRandomString()) =>
			apiHelpers.jsonWebServicesLayout.addLayout({
				groupId: site.id,
				options: {type: 'portlet'},
				title: layoutTitle,
			});

		const addSearchLayout = async (): Promise<Layout> => {
			const layout = await addLayout();

			await page.goto(`/web${site.friendlyUrlPath}${layout.friendlyURL}`);

			await searchPage.addPortlet('Search Bar', 'Search');

			await searchPage.addPortlet('Search Results', 'Search');

			return layout;
		};

		const destinationLayout = await addSearchLayout();

		const originLayout = await addSearchLayout();

		// The search bar used to fall back to a hardcoded '/search'
		// destination whenever its own was blank. That fallback only changes
		// where a suggestion opens if the site actually has a page at
		// '/search', so this decoy is what keeps the blank cases honest.

		await addLayout('search');

		await use({destinationLayout, originLayout, title});
	},
});

export {searchSuggestionsSiteTest};
