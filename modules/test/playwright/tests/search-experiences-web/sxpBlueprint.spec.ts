/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../fixtures/isolatedSiteTest';
import {loginTest} from '../../fixtures/loginTest';
import {productMenuPageTest} from '../../fixtures/productMenuPageTest';
import {searchExperiencesPagesTest} from '../../fixtures/searchExperiencesPageTest';
import {DEFAULT_SXP_BLUEPRINT_CONFIGURATION} from '../../helpers/SearchExperiencesApiHelper';
import {getRandomInt} from '../../utils/getRandomInt';
import {journalPagesTest} from '../journal-web/fixtures/journalPagesTest';

export const test = mergeTests(
	dataApiHelpersTest,
	isolatedSiteTest,
	featureFlagsTest({
		'LPS-129412': {enabled: true},
	}),
	journalPagesTest,
	productMenuPageTest,
	loginTest(),
	searchExperiencesPagesTest
);

test.describe('Blueprint table fields can toggle visibility', () => {
	const tableFieldsList = [
		'Description',
		'ID',
		'Author',
		'Created',
		'Modified',
	];

	test.beforeEach(async ({apiHelpers}) => {
		await test.step('Create blueprint with API', async () => {
			await apiHelpers.searchExperiences.createSXPBlueprint();
		});
	});

	test.afterEach(async ({page, sxpBlueprintsAndElementsViewPage}) => {
		await test.step('Select all blueprint table fields to view', async () => {
			for (const tableField of tableFieldsList) {
				const tableFieldMenuItem = page.getByRole('menuitem', {
					name: tableField,
				});

				if (!(await tableFieldMenuItem.isVisible())) {
					await sxpBlueprintsAndElementsViewPage.blueprintElementTableOpenFieldsMenuButton.click();
				}

				if (
					!(await tableFieldMenuItem
						.locator('.lexicon-icon-check')
						.isVisible())
				) {
					await tableFieldMenuItem.click();
				}

				await expect(
					sxpBlueprintsAndElementsViewPage.blueprintElementTableHeading
				).toContainText(tableField);
			}
		});
	});

	test('Deselect blueprint table fields from view', async ({
		page,
		sxpBlueprintsAndElementsViewPage,
	}) => {
		await test.step('Navigate to created blueprint', async () => {
			await sxpBlueprintsAndElementsViewPage.goto();
		});

		await test.step('Assert blueprint table fields are available', async () => {
			for (const tableField of tableFieldsList) {
				await expect(
					sxpBlueprintsAndElementsViewPage.blueprintElementTable.getByText(
						tableField
					)
				).toBeVisible();
			}
		});

		await test.step('Toggle off blueprint table fields', async () => {
			for (const tableField of tableFieldsList) {
				const tableFieldMenuItem = page.getByRole('menuitem', {
					name: tableField,
				});

				if (!(await tableFieldMenuItem.isVisible())) {
					await sxpBlueprintsAndElementsViewPage.blueprintElementTableOpenFieldsMenuButton.click();
				}

				await tableFieldMenuItem.click();

				await expect(
					tableFieldMenuItem.locator('.lexicon-icon-check')
				).not.toBeVisible();
			}
		});

		await test.step('Assert blueprint table fields are not available', async () => {
			for (const tableField of tableFieldsList) {
				await expect(
					sxpBlueprintsAndElementsViewPage.blueprintElementTableHeading
				).not.toContainText(tableField);
			}
		});
	});
});

test.describe('Saved blueprint can work as a collection provider', () => {
	let sxpBlueprint: SXPBlueprint;
	const blueprintConfiguration = DEFAULT_SXP_BLUEPRINT_CONFIGURATION;

	test.beforeEach(async ({apiHelpers}) => {
		blueprintConfiguration.generalConfiguration['collectionProvider'] =
			true;
		await test.step('Create blueprint with API', async () => {
			sxpBlueprint =
				await apiHelpers.searchExperiences.createSXPBlueprint({
					configuration: blueprintConfiguration,
				});
		});
	});

	test('Blueprint can select subtypes to affect search results @LPS-129412', async ({
		editSXPBlueprintPage,
		journalEditStructurePage,
		journalStructuresPage,
		page,
		site,
		sxpBlueprintsAndElementsViewPage,
	}) => {
		const testWebContentStructure = `Test Web Content ${getRandomInt()}`;

		await test.step('Create a web content structure', async () => {
			await journalStructuresPage.goto(site.friendlyUrlPath);

			await expect(journalStructuresPage.newButton).toBeVisible();
			await journalStructuresPage.newButton.click();

			await journalEditStructurePage.fieldsetsTab.click();
			await page
				.getByRole('button', {name: 'Press enter to add Basic Web'})
				.dblclick();

			await expect(
				page.locator('.ddm-field-container > .ddm-field')
			).toBeVisible();

			await journalEditStructurePage.fillFieldProperty(
				page.getByPlaceholder('Untitled Structure'),
				testWebContentStructure
			);

			await journalEditStructurePage.save();
		});

		await test.step('Navigate to created blueprint', async () => {
			await sxpBlueprintsAndElementsViewPage.goto();

			await sxpBlueprintsAndElementsViewPage.selectTableLink(
				sxpBlueprint.title
			);
		});

		await test.step('Add web content to blueprint searchableTypes', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.selectSearchableTypes({
				types: ['Web Content Article'],
				value: true,
			});
		});

		await test.step('Add test web content structure to blueprint under subtypes', async () => {
			await editSXPBlueprintPage.querySettings
				.locator('.list-group-item', {hasText: 'Web Content Article'})
				.getByRole('button', {name: 'Select Subtypes'})
				.click();

			await expect(
				editSXPBlueprintPage.modalDialog.getByText('Select Subtypes')
			).toBeVisible();

			const subtypeCheckbox = editSXPBlueprintPage.modalDialog.getByLabel(
				`Select ${testWebContentStructure}`
			);

			if (!(await subtypeCheckbox.isVisible())) {
				await editSXPBlueprintPage.modalDialog
					.getByLabel('Go to the next page')
					.click();
			}

			await subtypeCheckbox.check();

			await editSXPBlueprintPage.modalDialog
				.getByRole('button', {name: 'Done'})
				.click();

			await expect(
				editSXPBlueprintPage.page
					.locator('.list-group-item', {
						hasText: 'Web Content Article',
					})
					.locator('.label-item', {
						hasText: `${testWebContentStructure} (${site.name})`,
					})
			).toBeVisible();
		});

		await test.step('Search for "tree" in preview sidebar and find no results', async () => {
			await editSXPBlueprintPage.openPreviewSidebar();

			await editSXPBlueprintPage.searchInPreviewSidebar('tree');

			await editSXPBlueprintPage.assertPreviewSidebarNoResults();
		});
	});
});

test.describe('Created blueprint has accurate properties', () => {
	let sxpBlueprintId: string;

	test.afterEach(async ({apiHelpers}) => {
		if (sxpBlueprintId) {
			await apiHelpers.searchExperiences.deleteSXPBlueprint(
				sxpBlueprintId
			);
		}
	});

	test('Newly created blueprint starts with "Enable All" clause contributors @LPD-22974', async ({
		editSXPBlueprintPage,
		sxpBlueprintsAndElementsViewPage,
	}) => {
		const sxpBlueprintTitle = `Blueprint${getRandomInt()}`;

		await test.step('Create a blueprint via page', async () => {
			await sxpBlueprintsAndElementsViewPage.goto();

			await sxpBlueprintsAndElementsViewPage.createBlueprint({
				title: sxpBlueprintTitle,
			});
		});

		await test.step('Save ID for created blueprint', async () => {
			await expect(editSXPBlueprintPage.editTitleButton).toHaveText(
				sxpBlueprintTitle
			);

			sxpBlueprintId = await editSXPBlueprintPage.getSXPBlueprintId();
		});

		await test.step('Confirm clause contributors is set as Enable All', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.assertQuerySettingsRadioPropertySelection(
				'Enable All'
			);
		});
	});

	test('Newly created blueprint can opt in as Collection Provider @LPS-129412', async ({
		editSXPBlueprintPage,
		page,
		productMenuPage,
		sxpBlueprintsAndElementsViewPage,
	}) => {
		const sxpBlueprintTitle: string = `Blueprint${getRandomInt()}`;

		await test.step('Create a blueprint via page', async () => {
			await sxpBlueprintsAndElementsViewPage.goto();

			await sxpBlueprintsAndElementsViewPage.createBlueprint({
				isCollectionProvider: true,
				title: sxpBlueprintTitle,
			});
		});

		await test.step('Save ID for created blueprint', async () => {
			await expect(editSXPBlueprintPage.editTitleButton).toHaveText(
				sxpBlueprintTitle
			);

			sxpBlueprintId = await editSXPBlueprintPage.getSXPBlueprintId();
		});

		await test.step('Confirm collection provider status in Configuration tab', async () => {
			await editSXPBlueprintPage.goToConfigurationTab();

			const checkbox = page.getByLabel(
				'Enable as a Collection Provider',
				{exact: true}
			);

			await expect(checkbox).toBeChecked();
		});

		await test.step('Confirm collection provider status in table', async () => {
			await editSXPBlueprintPage.saveBlueprint();

			const blueprintRow = page.locator('.dnd-tr').filter({
				has: page.getByRole('link', {name: sxpBlueprintTitle}),
			});

			const collectionProviderCell = blueprintRow.locator(
				'.cell-collectionProvider'
			);

			await expect(collectionProviderCell).toHaveText('Yes');

			const typeSubtypeCell = blueprintRow.locator('.cell-typeSubtype');

			await expect(typeSubtypeCell).toHaveText('Asset');
		});

		await test.step('Go to collection provider page and view new blueprint collection', async () => {
			await page.goto('/');

			await productMenuPage.openProductMenuIfClosed();

			await productMenuPage.siteBuilderButton.click();

			await page
				.getByRole('menuitem', {
					name: 'Collections',
				})
				.click();

			await page
				.getByRole('link', {name: 'Collection Providers'})
				.click();

			await expect(page.getByText(sxpBlueprintTitle)).toBeVisible();
		});
	});
});

test.describe('Saved blueprint maintains accurate clause contributors', () => {
	let sxpBlueprint: SXPBlueprint;

	test.beforeEach(async ({apiHelpers, sxpBlueprintsAndElementsViewPage}) => {
		await test.step('Create blueprint with API', async () => {
			sxpBlueprint =
				await apiHelpers.searchExperiences.createSXPBlueprint();
		});

		await test.step('Navigate to created blueprint', async () => {
			await sxpBlueprintsAndElementsViewPage.goto();

			await sxpBlueprintsAndElementsViewPage.selectTableLink(
				sxpBlueprint.title
			);
		});
	});

	test('Saving "Enable All" clause contributors persists @LPD-22974', async ({
		editSXPBlueprintPage,
		sxpBlueprintsAndElementsViewPage,
	}) => {
		await test.step('Set clause contributors to "Enable All"', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.selectQuerySettingsRadioProperty(
				'Enable All'
			);

			await editSXPBlueprintPage.saveBlueprint();
		});

		await test.step('Check that "Enable All" setting persists', async () => {
			await sxpBlueprintsAndElementsViewPage.selectTableLink(
				sxpBlueprint.title
			);

			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.assertQuerySettingsRadioPropertySelection(
				'Enable All'
			);
		});
	});

	test('Saving "Disable All" clause contributors persists @LPD-22974', async ({
		editSXPBlueprintPage,
		sxpBlueprintsAndElementsViewPage,
	}) => {
		await test.step('Set clause contributors to "Disable All"', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.selectQuerySettingsRadioProperty(
				'Disable All'
			);

			await editSXPBlueprintPage.saveBlueprint();
		});

		await test.step('Check that "Disable All" setting persists', async () => {
			await sxpBlueprintsAndElementsViewPage.selectTableLink(
				sxpBlueprint.title
			);

			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.assertQuerySettingsRadioPropertySelection(
				'Disable All'
			);
		});
	});

	test('Saving "Customize - All Enabled" clause contributors persists @LPD-22974', async ({
		editSXPBlueprintPage,
		sxpBlueprintsAndElementsViewPage,
	}) => {
		await test.step('Set clause contributors to "Customize"', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.selectQuerySettingsRadioProperty(
				'Customize'
			);
		});

		await test.step('Assert all clause contributors are enabled by default', async () => {
			await editSXPBlueprintPage.openClauseContributorsSidebar();

			await editSXPBlueprintPage.assertClauseContributorSelection({
				labels: ['*'],
				value: true,
			});

			await editSXPBlueprintPage.saveBlueprint();
		});

		await test.step('Check that all enabled customized clause contributors persists', async () => {
			await sxpBlueprintsAndElementsViewPage.selectTableLink(
				sxpBlueprint.title
			);

			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.assertQuerySettingsRadioPropertySelection(
				'Customize'
			);

			await editSXPBlueprintPage.openClauseContributorsSidebar();

			await editSXPBlueprintPage.assertClauseContributorSelection({
				labels: ['*'],
				value: true,
			});
		});
	});

	test('Saving "Customize - All Disabled" clause contributors is set to "Disable All" @LPD-22974', async ({
		editSXPBlueprintPage,
		sxpBlueprintsAndElementsViewPage,
	}) => {
		await test.step('Set clause contributors to "Customize"', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.selectQuerySettingsRadioProperty(
				'Customize'
			);
		});

		await test.step('Disable all contributors', async () => {
			await editSXPBlueprintPage.openClauseContributorsSidebar();

			await editSXPBlueprintPage.selectClauseContributors({
				labels: ['*'],
				value: false,
			});

			await editSXPBlueprintPage.saveBlueprint();
		});

		await test.step('Check that all disabled customized clause contributors persists as "Disable All"', async () => {
			await sxpBlueprintsAndElementsViewPage.selectTableLink(
				sxpBlueprint.title
			);

			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.assertQuerySettingsRadioPropertySelection(
				'Disable All'
			);
		});
	});

	test('Saving "Customize - Varied" clause contributors persists @LPD-22974', async ({
		editSXPBlueprintPage,
		sxpBlueprintsAndElementsViewPage,
	}) => {
		await test.step('Set clause contributors to "Customize"', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.selectQuerySettingsRadioProperty(
				'Customize'
			);
		});

		await test.step('Vary clause contributors selection', async () => {
			await editSXPBlueprintPage.openClauseContributorsSidebar();

			await editSXPBlueprintPage.selectClauseContributors({
				labels: [
					'Account Entry Keyword Query Contributor',
					'Address Model Pre Filter Contributor',
					'Group Id Query Pre Filter Contributor',
				],
				value: false,
			});

			await editSXPBlueprintPage.saveBlueprint();
		});

		await test.step('Check that customized clause contributors persists', async () => {
			await sxpBlueprintsAndElementsViewPage.selectTableLink(
				sxpBlueprint.title
			);

			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.assertQuerySettingsRadioPropertySelection(
				'Customize'
			);

			await editSXPBlueprintPage.openClauseContributorsSidebar();

			await editSXPBlueprintPage.assertClauseContributorSelection({
				labels: [
					'Account Entry Keyword Query Contributor',
					'Address Model Pre Filter Contributor',
					'Group Id Query Pre Filter Contributor',
				],
				value: false,
			});
		});
	});
});

test.describe('Searching in preview with clause contributors is accurate', () => {
	let sxpBlueprint: SXPBlueprint;

	test.beforeEach(async ({apiHelpers, sxpBlueprintsAndElementsViewPage}) => {
		await test.step('Create blueprint with API', async () => {
			sxpBlueprint =
				await apiHelpers.searchExperiences.createSXPBlueprint();
		});

		await test.step('Navigate to created blueprint', async () => {
			await sxpBlueprintsAndElementsViewPage.goto();

			await sxpBlueprintsAndElementsViewPage.selectTableLink(
				sxpBlueprint.title
			);
		});
	});

	test('Searching with "Enable All" clause contributors returns expected result @LPD-22974', async ({
		editSXPBlueprintPage,
	}) => {
		await test.step('Set clause contributors to "Enable All"', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.selectQuerySettingsRadioProperty(
				'Enable All'
			);
		});

		await test.step('Search for "tree" in preview sidebar and find tree.png', async () => {
			await editSXPBlueprintPage.openPreviewSidebar();

			await editSXPBlueprintPage.searchInPreviewSidebar('tree');

			await editSXPBlueprintPage.assertPreviewSidebarSearchResult(
				'tree.png',
				[
					{
						label: 'entryClassName',
						value: 'com.liferay.document.library.kernel.model.DLFileEntry',
					},
					{label: 'userName', value: 'test test'},
				]
			);
		});
	});

	test('Searching with "Disable All" clause contributors returns no results @LPD-22974', async ({
		editSXPBlueprintPage,
	}) => {
		await test.step('Set clause contributors to "Disable All"', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.selectQuerySettingsRadioProperty(
				'Disable All'
			);
		});

		await test.step('Search for "tree" in preview sidebar and find no results', async () => {
			await editSXPBlueprintPage.openPreviewSidebar();

			await editSXPBlueprintPage.searchInPreviewSidebar('tree');

			await editSXPBlueprintPage.assertPreviewSidebarNoResults();
		});
	});

	test('Searching with "Customize - All Disabled" returns no results @LPD-22974', async ({
		editSXPBlueprintPage,
	}) => {
		await test.step('Set clause contributors to "Customize"', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.selectQuerySettingsRadioProperty(
				'Customize'
			);
		});

		await test.step('Disable all clause contributors', async () => {
			await editSXPBlueprintPage.openClauseContributorsSidebar();

			await editSXPBlueprintPage.selectClauseContributors({
				labels: ['*'],
				value: false,
			});
		});

		await test.step('Search for "tree" in preview sidebar and find no results', async () => {
			await editSXPBlueprintPage.openPreviewSidebar();

			await editSXPBlueprintPage.searchInPreviewSidebar('tree');

			await editSXPBlueprintPage.assertPreviewSidebarNoResults();
		});
	});

	test('Searching with only "DL File Entry Keyword Query Contributor" returns expected result @LPD-22974', async ({
		editSXPBlueprintPage,
	}) => {
		await test.step('Set clause contributors to "Customize"', async () => {
			await editSXPBlueprintPage.goToQuerySettingsMenuItem();

			await editSXPBlueprintPage.selectQuerySettingsRadioProperty(
				'Customize'
			);
		});

		await test.step('Enable only "DL File Entry" clause contributor', async () => {
			await editSXPBlueprintPage.openClauseContributorsSidebar();

			await editSXPBlueprintPage.selectClauseContributors({
				labels: ['*'],
				value: false,
			});

			await editSXPBlueprintPage.selectClauseContributors({
				labels: ['DL File Entry Keyword Query Contributor'],
				value: true,
			});
		});

		await test.step('Search for "tree" in preview sidebar and find file tree.png', async () => {
			await editSXPBlueprintPage.openPreviewSidebar();

			await editSXPBlueprintPage.searchInPreviewSidebar('tree');

			await editSXPBlueprintPage.assertPreviewSidebarSearchResult(
				'tree.png',
				[
					{
						label: 'entryClassName',
						value: 'com.liferay.document.library.kernel.model.DLFileEntry',
					},
					{label: 'userName', value: 'test test'},
				]
			);
		});
	});
});
