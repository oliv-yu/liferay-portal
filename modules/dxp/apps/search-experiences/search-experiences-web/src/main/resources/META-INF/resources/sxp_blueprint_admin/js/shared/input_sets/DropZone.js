/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import getCN from 'classnames';
import React from 'react';
import {useDrop} from 'react-dnd';

import {ITEM_TYPES} from './itemTypes';

function DropZone({index, isOverItem, move, noGap, paddingStyle = '10px 0'}) {
	const [{isOver}, drop] = useDrop(
		{
			accept: ITEM_TYPES.ITEM,
			collect: (monitor) => ({
				isOver: !!monitor.isOver(),
			}),
			drop: (item, monitor) => ({
				index,
				item,
				monitor,
			}),
		},
		[move]
	);

	return (
		<div
			className="input-sets-item-drop-zone-root"
			ref={drop}
			style={{padding: paddingStyle}}
		>
			<div
				className={getCN('input-sets-item-drop-zone-over', {
					'bg-primary': isOver || isOverItem,
				})}
				style={{
					height: isOver || isOverItem || !noGap ? '4px' : '0px',
				}}
			/>
		</div>
	);
}

export default DropZone;
