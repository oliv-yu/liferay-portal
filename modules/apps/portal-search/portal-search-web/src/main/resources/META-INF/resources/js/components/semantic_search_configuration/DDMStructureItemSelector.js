/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {openSelectionModal} from 'frontend-js-components-web';
import React from 'react';

export function DDMStructureItemSelector({namespace = '', url}) {
	return (
		<ClayButton
			aria-label={Liferay.Language.get('select')}
			className="btn-sm c-m-1"
			displayType="secondary"
			onClick={() => {
				openSelectionModal({
					id: `${namespace}selectDDMStructure`,
					multiple: true,
					onSelect: (selectedItem) => {
						if (!selectedItem) {
							return;
						}

						console.log(selectedItem);
					},
					selectEventName: `${namespace}selectDDMStructure`,
					title: Liferay.Language.get('select-subtypes'),
					url,
				});
			}}
			size="sm"
			type="button"
		>
			{Liferay.Language.get('select')}
		</ClayButton>
	);
}
