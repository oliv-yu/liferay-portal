/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

import {download} from '../shared/fdsPropsTransformerActions';
import {DEFAULT_HEADERS} from '../utils/fetch/fetch_data';

export default function propsTransformer({...otherProps}) {
	const TitleTableCell = ({actions, itemData}) => {
		const actionHref = actions.find(({data}) => data.id === 'view')?.href;

		return (
			<div className="table-list-title">
				<a href={actionHref.replace(`%7Bid%7D`, itemData.id)}>
					{itemData.title}
				</a>
			</div>
		);
	};

	const titleTableCellRenderer = {
		component: TitleTableCell,
		name: 'titleTableCellRenderer',
		type: 'internal',
	};

	return {
		...otherProps,
		customRenderers: {
			tableCell: [titleTableCellRenderer],
		},
		onActionDropdownItemClick({action, itemData}) {
			if (action.data.id === 'export') {
				download(
					`/o/search-experiences-rest/v1.0/sxp-elements/${itemData.id}/export`,
					{headers: DEFAULT_HEADERS, method: 'GET'},
					itemData.title
				);
			}
		},
	};
}
