/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import {openSelectionModal} from 'frontend-js-web';
import React, {useContext, useState} from 'react';

import SheetWrapper from '../../shared/SheetWrapper';
import ThemeContext from '../../shared/ThemeContext';

export default function ScopeSelector({onChangeScope, scope}) {
	const {namespace, selectGroupURL} = useContext(ThemeContext);
	const [scopeList, setScopeList] = useState([]); // first just setup a state to test scope changes

	const _handleAddScope = () => {
		openSelectionModal({
			id: `${namespace}selectSite`,
			onSelect: (selectedItem) => {
				if (!selectedItem) {
					return;
				}

				const {
					groupdescriptivename,
					groupexternalreferencecode,
					groupid,
					groupscopelabel,
				} = selectedItem;

				setScopeList([
					...scopeList,
					{
						groupdescriptivename,
						groupexternalreferencecode,
						groupid,
						groupscopelabel,
					},
				]);

				console.log(selectedItem);
			},
			selectEventName: `${namespace}selectGroup`,
			title: Liferay.Language.get('select-site'),
			url: selectGroupURL,
		});
	};

	const _handleDeleteScope = (index) => () => {
		setScopeList(scopeList.filter((_, i) => i !== index));
	};

	return (
		<SheetWrapper
			description={Liferay.Language.get('scope-description')}
			helpText={Liferay.Language.get('scope-help')}
			title={Liferay.Language.get('scope')}
		>
			<ClayButton displayType="secondary" onClick={_handleAddScope}>
				<span className="inline-item inline-item-before">
					<ClayIcon symbol="plus" />
				</span>

				{Liferay.Language.get('select-site-or-asset-library')}
			</ClayButton>

			{!!scopeList.length && (
				<div className="c-mt-4 scope-selection-list">
					<table className="table table-autofit table-bordered table-list table-nowrap">
						<thead>
							<tr>
								<th className="table-cell-expand table-head-title">
									<span className="inline-item inline-item-before">
										{Liferay.Language.get('name')}
									</span>
								</th>

								<th className="table-cell-expand table-head-title">
									<span className="inline-item inline-item-before">
										{Liferay.Language.get('type')}
									</span>
								</th>

								<th className="table-head-title">
									<span className="inline-item inline-item-before">
										{Liferay.Language.get('options')}
									</span>
								</th>
							</tr>
						</thead>

						<tbody>
							{scopeList.map((item, index) => (
								<tr key={`${index}-${item.groupid}`}>
									<td className="table-cell-expand">
										<div className="table-list-title">
											{item.groupdescriptivename}
										</div>
									</td>

									<td className="table-cell-expand">
										<div>{item.groupscopelabel}</div>
									</td>

									<td>
										<ClayButton
											borderless
											displayType="secondary"
											monospaced
											onClick={_handleDeleteScope(index)}
										>
											<ClayIcon symbol="times-circle" />
										</ClayButton>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</SheetWrapper>
	);
}
