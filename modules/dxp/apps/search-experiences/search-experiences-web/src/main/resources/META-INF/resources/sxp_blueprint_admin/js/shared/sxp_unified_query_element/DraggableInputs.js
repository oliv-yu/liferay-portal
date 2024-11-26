/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import getCN from 'classnames';
import React from 'react';

import InputSets from '../input_sets/index';
import {useInputSets} from '../input_sets/useInputSets';
import FilterInput from './FilterInput';

function Inputs({
	elementType = 'filter',
	index,
	namespace,
	onInputSetItemChange,
	value,
}) {
	if (elementType === 'filter') {
		return (
			<FilterInput
				onInputSetItemChange={onInputSetItemChange}
				value={value}
			/>
		);
	}
}

export default function DraggableInputs({
	elementType,
	itemArray = [],
	namespace = '',
}) {
	const {
		getInputSetItemProps,
		onInputSetItemChange,
		onInputSetsAdd,
		onInputSetsChange,
		value: draggableItemArray,
	} = useInputSets(itemArray);

	return (
		<InputSets>
			{draggableItemArray.map((valueItem, valueIndex) => {
				const {
					index,
					isLastItem,
					key,
					onInputSetItemDelete,
					onInputSetItemMove,
				} = getInputSetItemProps(valueItem, valueIndex);

				return (
					<InputSets.Item
						index={index}
						isLastItem={isLastItem}
						key={key}
						onInputSetItemDelete={onInputSetItemDelete}
						onInputSetItemMove={onInputSetItemMove}
					>
						<Inputs
							elementType={elementType}
							index={valueIndex}
							namespace={namespace}
							onInputSetItemChange={onInputSetItemChange}
							value={valueItem}
						/>
					</InputSets.Item>
				);
			})}

			<ClayButton
				aria-label={Liferay.Language.get('add-range')}
				className={getCN({
					'c-mt-4': !draggableItemArray.length,
				})}
				displayType="secondary"
				onClick={onInputSetsAdd}
				size="sm"
			>
				<span className="inline-item inline-item-before">
					<ClayIcon symbol="plus" />
				</span>

				{Liferay.Language.get('add-query')}
			</ClayButton>
		</InputSets>
	);
}
