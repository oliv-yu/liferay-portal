/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Page, expect, mergeTests} from '@playwright/test';

import {loginTest} from '../../../fixtures/loginTest';
import {SearchPage} from '../../../pages/portal-search-web/SearchPage';
import {searchSuggestionsSiteTest} from './fixtures/searchSuggestionsSiteTest';

export const test = mergeTests(loginTest(), searchSuggestionsSiteTest);

const layoutPathname = (site: Site, layout: Layout) =>
	`/web${site.friendlyUrlPath}${layout.friendlyURL}`;

async function expectSuggestionToTarget({
	layout,
	searchPage,
	site,
	title,
}: {
	layout: Layout;
	searchPage: SearchPage;
	site: Site;
	title: string;
}) {
	await searchPage.openSuggestions(title);

	const href = await searchPage.getSuggestionItem(title).getAttribute('href');

	expect(new URL(href).pathname).toBe(layoutPathname(site, layout));
}

async function expectSearchesToStayOn({
	layout,
	page,
	searchPage,
	site,
	title,
}: {
	layout: Layout;
	page: Page;
	searchPage: SearchPage;
	site: Site;
	title: string;
}) {
	await page.goto(layoutPathname(site, layout));

	// Pressing Enter and clicking a suggestion have to agree on where a blank
	// destination page sends the user. Asserting the keywords landed as well
	// as the pathname is what keeps this honest, since a search that never ran
	// would leave the URL on this page too.

	await searchPage.searchKeywordInMainContent(title);

	await expect(page).toHaveURL(
		(url) =>
			url.pathname === layoutPathname(site, layout) &&
			url.searchParams.get('q') === title
	);

	await page.goto(layoutPathname(site, layout));

	await expectSuggestionToTarget({layout, searchPage, site, title});
}

test.describe('Suggestion Destination', () => {
	test(
		'Suggestions target the destination page of the search bar',
		{tag: ['@LPS-164852', '@LPS-182927']},
		async ({page, searchPage, searchSuggestionsSite, site}) => {
			const {destinationLayout, originLayout, title} =
				searchSuggestionsSite;

			await page.goto(layoutPathname(site, originLayout));

			await searchPage.setSearchBarDestinationPage(
				destinationLayout.friendlyURL
			);

			await expectSuggestionToTarget({
				layout: destinationLayout,
				searchPage,
				site,
				title,
			});
		}
	);

	test(
		'Enter and suggestions both stay on the current page again if the destination page is cleared',
		{tag: '@LPD-101361'},
		async ({page, searchPage, searchSuggestionsSite, site}) => {
			const {originLayout, title} = searchSuggestionsSite;

			await page.goto(layoutPathname(site, originLayout));

			await searchPage.setSearchBarDestinationPage('');

			await expectSearchesToStayOn({
				layout: originLayout,
				page,
				searchPage,
				site,
				title,
			});
		}
	);

	test(
		'Going back from an opened suggestion returns to the page it was opened from',
		{tag: '@LPS-182927'},
		async ({page, searchPage, searchSuggestionsSite, site}) => {
			const {destinationLayout, originLayout, title} =
				searchSuggestionsSite;

			await test.step('Point the search bar at the destination page', async () => {
				await page.goto(layoutPathname(site, originLayout));

				await searchPage.openSearchBarConfigurationInNavBar();

				await searchPage.fillPortletConfigurationsInput([
					{
						label: 'Destination Page',
						value: destinationLayout.friendlyURL,
					},
				]);

				await searchPage.savePortletConfiguration();
			});

			await test.step('Open the suggestion from the origin page', async () => {

				// The dropdown rerenders as its requests settle, which can
				// swallow a click, so reopen and click again until the
				// destination page actually loads.

				await expect(async () => {
					if (
						new URL(page.url()).pathname !==
						layoutPathname(site, destinationLayout)
					) {
						await page.goto(layoutPathname(site, originLayout));

						await searchPage.openSuggestions(title);

						await searchPage
							.getSuggestionItem(title)
							.click({timeout: 5000});
					}

					await expect(page).toHaveURL(
						(url) =>
							url.pathname ===
							layoutPathname(site, destinationLayout),
						{timeout: 5000}
					);
				}).toPass({timeout: 60000});
			});

			await test.step('Check that the destination page shows the asset', async () => {
				await expect(searchPage.searchResults).toContainText(title);
			});

			await test.step('Check that the back link returns to the origin page', async () => {
				await page.getByRole('link', {name: 'Go to'}).click();

				await expect(page).toHaveURL(
					(url) => url.pathname === layoutPathname(site, originLayout)
				);
			});
		}
	);
});
