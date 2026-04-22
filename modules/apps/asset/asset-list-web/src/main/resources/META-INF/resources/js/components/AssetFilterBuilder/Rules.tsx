/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

export const RULES_MAP = {
	fields: [
		{id: 'categories', label: 'Categories', type: 'category'},
		{id: 'title', label: 'Title', type: 'text'},
		{id: 'random', label: 'Random', type: 'boolean'},
		{id: 'modifiedDate', label: 'Modified Date', type: 'date'},
		{id: 'migrationTime', label: 'Migration Time', type: 'date-time'},
		{id: 'pageView', label: 'Page View', type: 'number'},
		{id: 'keywords', label: 'Keywords', type: 'text'},
		{id: 'author', label: 'Author', type: 'single-select'},
		{id: 'tags', label: 'Tags', type: 'tag'},
	],
	operators: {
		'boolean': [
			{id: 'true', label: 'Is True'},
			{id: 'false', label: 'Is False'},
		],
		'category': [
			{id: 'contains', label: 'Contains', next: 'category-picker'},
			{
				id: 'not_contains',
				label: 'Does Not Contain',
				next: 'category-picker',
			},
		],
		'date': [
			{id: 'equals', label: 'Equals', next: 'date-input'},
			{id: 'notEquals', label: 'Not Equals', next: 'date-input'},
			{id: 'gt', label: 'Greater Than', next: 'date-input'},
			{
				id: 'gte',
				label: 'Greater Than Or Equals',
				next: 'date-input',
			},
			{id: 'lt', label: 'Less Than', next: 'date-input'},
			{id: 'lte', label: 'Less Than Or Equals', next: 'date-input'},
			{id: 'between', label: 'Between', next: 'date-range'},
		],
		'date-time': [
			{id: 'equals', label: 'Equals', next: 'date-time-input'},
			{
				id: 'notEquals',
				label: 'Not Equals',
				next: 'date-time-input',
			},
			{id: 'gt', label: 'Greater Than', next: 'date-time-input'},
			{
				id: 'gte',
				label: 'Greater Than Or Equals',
				next: 'date-time-input',
			},
			{id: 'lt', label: 'Less Than', next: 'date-time-input'},
			{
				id: 'lte',
				label: 'Less Than Or Equals',
				next: 'date-time-input',
			},
			{id: 'between', label: 'Between', next: 'date-range'},
		],
		'multi-select': [
			{
				id: 'contains',
				label: 'Contains',
				next: 'multi-select-input',
			},
			{
				id: 'not_contains',
				label: 'Does Not Contain',
				next: 'multi-select-input',
			},
		],
		'number': [
			{id: 'equals', label: 'Equals', next: 'number-input'},
			{id: 'notEquals', label: 'Not Equals', next: 'number-input'},
			{id: 'gt', label: 'Greater Than', next: 'number-input'},
			{
				id: 'gte',
				label: 'Greater Than Or Equals',
				next: 'number-input',
			},
			{id: 'lt', label: 'Less Than', next: 'number-input'},
			{
				id: 'lte',
				label: 'Less Than Or Equals',
				next: 'number-input',
			},
			{id: 'between', label: 'Between', next: 'number-range'},
		],
		'single-select': [
			{
				id: 'contains',
				label: 'Contains',
				next: 'single-select-input',
			},
			{
				id: 'not_contains',
				label: 'Does Not Contain',
				next: 'single-select-input',
			},
		],
		'tag': [
			{id: 'contains', label: 'Contains', next: 'tag-picker'},
			{
				id: 'not_contains',
				label: 'Does Not Contain',
				next: 'tag-picker',
			},
		],
		'text': [
			{id: 'contains', label: 'Contains', next: 'text-input'},
			{
				id: 'not_contains',
				label: 'Does Not Contain',
				next: 'text-input',
			},
		],
	},
	inputs: {
		'category-picker': {
			component: 'CategoryPicker',
			source: '/api/categories',
		},
		'date-input': {component: 'SingleDatePicker'},
		'date-range': {component: 'DoubleDatePicker'},
		'date-time-input': {component: 'SingleDateTimePicker'},
		'date-time-range': {component: 'DoubleDateTimePicker'},
		'multi-select-input': {component: 'Multiselect'},
		'number-input': {component: 'SingleNumberPicker'},
		'number-range': {component: 'DoubleNumberPicker'},
		'single-select-input': {component: 'SingleSelect'},
		'tag-picker': {component: 'TagPicker', source: '/api/tags'},
		'text-input': {component: 'Text'},
	},
};
