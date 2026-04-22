/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import React, {useCallback, useState} from 'react';

import RuleBuilderItem from './RuleBuilderItem';

export default function RuleBuilder() {
	const [rules, setRules] = useState([{}]);

	function _handleDeleteButtonClick(index: number) {
		setRules((prevRules) => prevRules.filter((_, i) => i !== index));
	}

	const _handleAddButtonClick = useCallback(() => {
		setRules((prevRules) => [...prevRules, {}]);
	}, []);

	return (
		<div className="collections-rule-builder">
			{rules.map((rule, index) => (
				<RuleBuilderItem
					index={index}
					key={index}
					onDeleteButtonClick={() => _handleDeleteButtonClick(index)}
					rule={rule}
					showDeleteButton={true}
				/>
			))}

			<ClayButton
				aria-label={Liferay.Language.get('add-filter')}
				displayType="secondary"
				onClick={_handleAddButtonClick}
				>
					{Liferay.Language.get('add-filter')}
			</ClayButton>
		</div>
	);

}
