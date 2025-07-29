/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayLayout from '@clayui/layout';
import React from 'react';

import InputSetItemHeader from './InputSetItemHeader';
import CharacterThresholdInput from './inputs/CharacterThresholdInput';
import DisplayGroupNameInput from './inputs/DisplayGroupNameInput';
import SizeInput from './inputs/SizeInput';

function Basic({index, onBlur, onInputSetItemChange, touched, value}) {
	const _handleChangeAttribute = (property) => (event) => {
		onInputSetItemChange(index, {
			attributes: {
				...value.attributes,
				[property]: event.target.value,
			},
		});
	};

	return (
		<>
			<ClayLayout.Row className="w-100">
				<ClayLayout.Col className="c-px-1" size={12}>
					<InputSetItemHeader>
						<InputSetItemHeader.Title>
							{Liferay.Language.get(
								'basic-suggestions-contributor'
							)}
						</InputSetItemHeader.Title>

						<InputSetItemHeader.Description>
							{Liferay.Language.get(
								'basic-suggestions-contributor-help'
							)}
						</InputSetItemHeader.Description>
					</InputSetItemHeader>
				</ClayLayout.Col>
			</ClayLayout.Row>

			<ClayLayout.Row className="c-mb-3 w-100">
				<ClayLayout.Col className="c-px-1" size={6}>
					<DisplayGroupNameInput
						index={index}
						onBlur={onBlur('displayGroupName')}
						onChange={onInputSetItemChange(
							index,
							'displayGroupName'
						)}
						touched={touched.displayGroupName}
						value={value.displayGroupName}
					/>
				</ClayLayout.Col>

				<ClayLayout.Col className="c-px-1" size={6}>
					<SizeInput
						index={index}
						onBlur={onBlur('size')}
						onChange={onInputSetItemChange(index, 'size')}
						touched={touched.size}
						value={value.size}
					/>
				</ClayLayout.Col>
			</ClayLayout.Row>

			<ClayLayout.Row className="w-100">
				<ClayLayout.Col className="c-px-1" size={12}>
					<CharacterThresholdInput
						index={index}
						onBlur={onBlur('attributes.characterThreshold')}
						onChange={_handleChangeAttribute('characterThreshold')}
						touched={touched['attributes.characterThreshold']}
						value={value.attributes?.characterThreshold}
					/>
				</ClayLayout.Col>
			</ClayLayout.Row>
		</>
	);
}

export default Basic;
