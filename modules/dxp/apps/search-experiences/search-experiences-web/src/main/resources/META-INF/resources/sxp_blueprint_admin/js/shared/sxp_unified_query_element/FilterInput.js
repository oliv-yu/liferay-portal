/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayForm, {ClayInput, ClaySelect} from '@clayui/form';
import React from 'react';

const FILTER_OPTIONS = [
	[
		{
			label: Liferay.Language.get('deployment-mode'),
			value: 'deploymentMode',
		},
		{label: Liferay.Language.get('status'), value: 'status'},
	],
	[
		{
			label: Liferay.Language.get('contains'),
			value: 'contains',
		},
		{
			label: Liferay.Language.get('does-not-contain'),
			value: 'doesNotContain',
		},
	],
	[
		{
			label: Liferay.Language.get('any-of-the-following'),
			value: 'any',
		},
		{
			label: Liferay.Language.get('all-of-the-following'),
			value: 'all',
		},
	],
];

export default function FilterInput() {
	return (
		<>
			<ClayForm.Text>{Liferay.Language.get('filter-by')}</ClayForm.Text>

			<ClayInput.GroupItem>
				<ClaySelect
					aria-label={Liferay.Language.get('filter-by')}
					id="filterBy"
				>
					{FILTER_OPTIONS[0].map((item) => (
						<ClaySelect.Option
							key={item.value}
							label={item.label}
							value={item.value}
						/>
					))}
				</ClaySelect>
			</ClayInput.GroupItem>

			<ClayInput.GroupItem>
				<ClaySelect
					aria-label={Liferay.Language.get('contains')}
					id="contains"
				>
					{FILTER_OPTIONS[1].map((item) => (
						<ClaySelect.Option
							key={item.value}
							label={item.label}
							value={item.value}
						/>
					))}
				</ClaySelect>
			</ClayInput.GroupItem>

			<ClayInput.GroupItem>
				<ClaySelect
					aria-label={Liferay.Language.get('following')}
					id="following"
				>
					{FILTER_OPTIONS[2].map((item) => (
						<ClaySelect.Option
							key={item.value}
							label={item.label}
							value={item.value}
						/>
					))}
				</ClaySelect>
			</ClayInput.GroupItem>
		</>
	);
}
