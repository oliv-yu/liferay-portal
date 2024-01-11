/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpers.fixture';
import {portalSearchTuningWebPagesTest} from '../../fixtures/portalSearchTuningWebPages.fixture';
import {getRandomInt} from '../../utils/util';

export const test = mergeTests(apiHelpersTest, portalSearchTuningWebPagesTest);

test('shows a warning for actions on not-applicable rankings', async ({
	_apiHelpers,
	_resultRankingsPage,
}) => {
	const sxpBlueprint = await _apiHelpers.searchExperiences.postRandomSXPBlueprint();

	const resultRankingSearchQuery = 'resultRanking' + getRandomInt();

	await _resultRankingsPage.createNewResultRanking({
		scope: 'Blueprint',
		scopeERF: sxpBlueprint.externalReferenceCode,
		searchQuery: resultRankingSearchQuery,
		status: 'Inactive',
	});

	await _apiHelpers.searchExperiences.deleteSXPBlueprint(sxpBlueprint.id);

	await _resultRankingsPage.goTo();

	await _resultRankingsPage.chooseManagementToolbarAction(
		{searchQuery: resultRankingSearchQuery, status: 'Not Applicable'},
		'Activate'
	);

	await _resultRankingsPage.assertErrorMessage(
		'The selected action could not be performed on the rankings with a not applicable status.'
	);

	await expect(
		_resultRankingsPage.getResultRankingRow({
			searchQuery: resultRankingSearchQuery,
			status: 'Not Applicable',
		})
	).toBeVisible();

	// Clean up

	await _resultRankingsPage.deleteResultRanking({
		searchQuery: resultRankingSearchQuery,
	});
});

test('cannot activate a duplicate query and scope', async ({
	_resultRankingsPage,
}) => {
	const resultRankingSearchQuery = 'resultRanking' + getRandomInt();

	await _resultRankingsPage.createNewResultRanking({
		searchQuery: resultRankingSearchQuery,
		status: 'Inactive',
	});
	await _resultRankingsPage.createNewResultRanking({
		searchQuery: resultRankingSearchQuery,
		status: 'Active',
	});

	await _resultRankingsPage.chooseManagementToolbarAction(
		{searchQuery: resultRankingSearchQuery, status: 'Inactive'},
		'Activate'
	);

	await _resultRankingsPage.assertErrorMessage(
		'Active search queries and aliases with a given scope must be unique across all rankings.'
	);

	// Clean up

	await _resultRankingsPage.deleteResultRanking({
		searchQuery: resultRankingSearchQuery,
		status: 'Inactive',
	});
	await _resultRankingsPage.deleteResultRanking({
		searchQuery: resultRankingSearchQuery,
		status: 'Active',
	});
});
