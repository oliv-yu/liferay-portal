/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Page, expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../../fixtures/apiHelpersTest';
import {collectionsPagesTest} from '../../../fixtures/collectionsPagesTest';
import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {pageEditorPagesTest} from '../../../fixtures/pageEditorPagesTest';
import {pageViewModePagesTest} from '../../../fixtures/pageViewModePagesTest';
import {pagesAdminPagesTest} from '../../../fixtures/pagesAdminPagesTest';
import getRandomString from '../../../utils/getRandomString';
import getPageDefinition from '../../layout-content-page-editor-web/main/utils/getPageDefinition';
import {generateObjectFields} from '../../object-web/utils/generateObjectFields';

/**
 * End-to-end coverage for LPD-89039: ordering a dynamic Collection by an
 * Object field. The collection is configured through the real Order By UI and
 * rendered through a Collection Display so the saved
 * {classNameId, classTypeId, propertyName} descriptor is exercised all the way
 * to a nested FieldSort.
 *
 * NOTE: the dynamic-collection editor steps (Item Type select, the Order By
 * picker, the ASC/DESC toggle) and the Date entry format are not yet covered by
 * a shared Page class, so the selectors below are best-effort and should be
 * smoke-run once against a live bundle to settle any label/format differences.
 * The assertions read the rendered order, which is the only externally visible
 * proof that the nested sort was built correctly.
 */

const test = mergeTests(
	apiHelpersTest,
	collectionsPagesTest,
	dataApiHelpersTest,
	featureFlagsTest({
		'LPD-74731': {enabled: true},
		'LPS-178052': {enabled: true},
	}),
	isolatedSiteTest,
	loginTest(),
	pageEditorPagesTest,
	pageViewModePagesTest,
	pagesAdminPagesTest
);

interface OrderableObject {
	amountFieldName: string;
	dueDateFieldName: string;
	label: string;
	name: string;
	nameFieldName: string;
}

test.describe('Order Collections by Object Fields', () => {
	test.beforeEach(({page}) => {
		page.setViewportSize({height: 1080, width: 1920});
	});

	test(
		'orders a collection by an object decimal field numerically, not lexically',
		{tag: '@LPD-89039'},
		async ({apiHelpers, collectionsPage, page, pageEditorPage, site}) => {

			// Values chosen so a lexical sort (9, 10, 100, 25) would differ from
			// a numeric one (9, 10, 25, 100): proves the value_double subfield.

			const object = await _createOrderableObject(apiHelpers, [
				{amount: 100, dueDate: '2026-03-01', name: 'Gamma'},
				{amount: 9, dueDate: '2026-01-01', name: 'Alpha'},
				{amount: 25, dueDate: '2026-04-01', name: 'Delta'},
				{amount: 10, dueDate: '2026-02-01', name: 'Beta'},
			]);

			const collectionName = getRandomString();

			await _createOrderedCollection(collectionsPage, page, {
				collectionName,
				objectLabel: object.label,
				orderByType: 'Ascending',
				propertyLabel: object.amountFieldName,
			});

			await _renderCollectionOnPage(
				apiHelpers,
				pageEditorPage,
				site,
				collectionName
			);

			await expect(async () => {
				expect(
					await _renderedOrder(page, [
						'Alpha',
						'Beta',
						'Delta',
						'Gamma',
					])
				).toEqual(['Alpha', 'Beta', 'Delta', 'Gamma']);
			}).toPass({timeout: 60 * 1000});
		}
	);

	test(
		'orders a collection by an object date field and reverses on direction toggle',
		{tag: '@LPD-89039'},
		async ({apiHelpers, collectionsPage, page, pageEditorPage, site}) => {
			const object = await _createOrderableObject(apiHelpers, [
				{amount: 1, dueDate: '2026-03-01', name: 'Gamma'},
				{amount: 2, dueDate: '2026-01-01', name: 'Alpha'},
				{amount: 3, dueDate: '2026-02-01', name: 'Beta'},
			]);

			const collectionName = getRandomString();

			// Ascending due date -> Alpha (Jan), Beta (Feb), Gamma (Mar)

			await _createOrderedCollection(collectionsPage, page, {
				collectionName,
				objectLabel: object.label,
				orderByType: 'Ascending',
				propertyLabel: object.dueDateFieldName,
			});

			await _renderCollectionOnPage(
				apiHelpers,
				pageEditorPage,
				site,
				collectionName
			);

			const names = ['Alpha', 'Beta', 'Gamma'];

			await expect(async () => {
				expect(await _renderedOrder(page, names)).toEqual([
					'Alpha',
					'Beta',
					'Gamma',
				]);
			}).toPass({timeout: 60 * 1000});

			// Flip to Descending -> Gamma, Beta, Alpha

			await collectionsPage.goto(site.friendlyUrlPath);
			await _openCollection(page, collectionName);
			await _toggleOrderDirection(page, 'Descending');
			await _saveCollection(page);

			await page.reload();

			await expect(async () => {
				expect(await _renderedOrder(page, names)).toEqual([
					'Gamma',
					'Beta',
					'Alpha',
				]);
			}).toPass({timeout: 60 * 1000});
		}
	);
});

// Builds a published object (Text "name", Decimal "amount", Date "dueDate", all
// indexed) and posts the given entries with controlled values.

async function _createOrderableObject(
	apiHelpers,
	entries: Array<{amount: number; dueDate: string; name: string}>
): Promise<OrderableObject> {
	const objectFields = generateObjectFields({
		objectFieldBusinessTypes: [
			{businessType: 'Text', indexed: true},
			{businessType: 'Decimal', indexed: true},
			{businessType: 'Date', indexed: true},
		],
	});

	const [nameField, amountField, dueDateField] = objectFields;

	const objectDefinition =
		await apiHelpers.objectAdmin.postRandomObjectDefinition({
			objectFields,
			status: {code: 0},
			titleObjectFieldName: nameField.name,
		});

	apiHelpers.data.push({
		id: objectDefinition.id,
		type: 'objectDefinition',
	});

	await apiHelpers.objectAdmin.postObjectDefinitionPublish({
		objectDefinitionId: objectDefinition.id,
	});

	await apiHelpers.objectEntry.postObjectEntriesBatch(
		'c/' + objectDefinition.name.toLowerCase() + 's',
		entries.map((entry) => ({
			[amountField.name]: entry.amount,
			[dueDateField.name]: entry.dueDate,
			[nameField.name]: entry.name,
		}))
	);

	return {
		amountFieldName: amountField.label?.en_US ?? amountField.name,
		dueDateFieldName: dueDateField.label?.en_US ?? dueDateField.name,
		label: objectDefinition.label['en_US'],
		name: objectDefinition.name,
		nameFieldName: nameField.label?.en_US ?? nameField.name,
	};
}

// Creates a dynamic collection, points it at the object, and sets Order By.

async function _createOrderedCollection(
	collectionsPage,
	page: Page,
	{
		collectionName,
		objectLabel,
		orderByType,
		propertyLabel,
	}: {
		collectionName: string;
		objectLabel: string;
		orderByType: 'Ascending' | 'Descending';
		propertyLabel: string;
	}
) {
	await collectionsPage.goto();

	await collectionsPage.addNewDynamicCollection(collectionName);

	// Source: pick the object as the collection's Item Type.

	await page.getByLabel('Item Type').selectOption({label: objectLabel});

	// Order By: open the picker and choose the object field by its label.

	await page.getByLabel('Order By', {exact: true}).click();
	await page.getByRole('option', {name: propertyLabel}).click();

	if (orderByType === 'Descending') {
		await _toggleOrderDirection(page, 'Descending');
	}

	await _saveCollection(page);
}

async function _openCollection(page: Page, collectionName: string) {
	await page.getByRole('link', {name: collectionName}).click();
}

async function _toggleOrderDirection(
	page: Page,
	direction: 'Ascending' | 'Descending'
) {

	// The toggle's accessible name is the action it performs, so clicking the
	// button labeled "Descending" switches an ascending sort to descending.

	await page.getByRole('button', {name: direction}).first().click();
}

async function _saveCollection(page: Page) {
	await page.getByRole('button', {name: 'Save'}).click();
}

// Drops a Collection Display on a fresh page, bound to the named user
// collection, in Table style, and publishes it.

async function _renderCollectionOnPage(
	apiHelpers,
	pageEditorPage,
	site,
	collectionName: string
) {
	const layout = await apiHelpers.headlessDelivery.createSitePage({
		pageDefinition: getPageDefinition(),
		siteId: site.id,
		title: getRandomString(),
	});

	await pageEditorPage.goto(layout, site.friendlyUrlPath);

	await pageEditorPage.addFragment('Content Display', 'Collection Display');

	await pageEditorPage.selectFragment(
		await pageEditorPage.getFragmentId('Collection Display')
	);

	await pageEditorPage.chooseCollectionDisplayCollection(
		'Collections',
		collectionName,
		{search: true}
	);

	await pageEditorPage.waitForChangesSaved();

	await pageEditorPage.selectFragment(
		await pageEditorPage.getFragmentId('Collection Display')
	);

	await pageEditorPage.changeConfiguration({
		fieldLabel: 'Style Display',
		tab: 'General',
		value: 'Table',
	});

	await pageEditorPage.waitForChangesSaved();

	await pageEditorPage.publishPage();

	await pageEditorPage.page.goto(
		`/web${site.friendlyUrlPath}${layout.friendlyUrlPath}`
	);
}

// Returns the given names in the order they appear in the rendered table,
// ignoring any name that is not present yet (so it retries cleanly until the
// index catches up).

async function _renderedOrder(
	page: Page,
	names: string[]
): Promise<string[]> {
	const rowTexts = await page
		.getByRole('table')
		.getByRole('row')
		.allInnerTexts();

	return names
		.map((name) => ({
			index: rowTexts.findIndex((rowText) => rowText.includes(name)),
			name,
		}))
		.filter((entry) => entry.index >= 0)
		.sort((a, b) => a.index - b.index)
		.map((entry) => entry.name);
}
