/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import React from 'react';
import {useDrag, useDrop} from 'react-dnd';

import {ITEM_TYPES} from './itemTypes';

/**
 * Props are calculated in the `useInputSets` function `_getInputSetItemProps`.
 * @see {@link useInputSets#_getInputSetItemProps}
 */
function TableItem({
	children,
	index,
	onInputSetItemDelete,
	onInputSetItemMove,
}) {
	const [{isDragging}, drag, dragPreview] = useDrag({
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();

			if (dropResult) {
				onInputSetItemMove(item.index, dropResult.index);
			}
		},
		item: {index, type: ITEM_TYPES.ITEM},
	});

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
		[onInputSetItemMove]
	);

	return (
		<tr
			ref={(node) => dragPreview(drop(node))}
			style={{borderTop: isOver && '4px solid #0b5fff'}}
		>
			<td
				ref={drag}
				style={{
					cursor: 'move',
					opacity: isDragging ? 0.5 : 1,
				}}
			>
				<ClayButton
					aria-label={Liferay.Language.get('move')}
					borderless
					displayType="secondary"
					monospaced
					small
				>
					<ClayIcon symbol="drag" />
				</ClayButton>
			</td>

			{children}

			{onInputSetItemDelete && (
				<td>
					<ClayButton
						aria-label={Liferay.Language.get('delete')}
						borderless
						className="c-ml-2"
						disabled={!onInputSetItemDelete}
						displayType="secondary"
						monospaced
						onClick={
							onInputSetItemDelete
								? onInputSetItemDelete(index)
								: undefined
						}
						small
					>
						<ClayIcon symbol="times-circle" />
					</ClayButton>
				</td>
			)}
		</tr>
	);
}

export default TableItem;
