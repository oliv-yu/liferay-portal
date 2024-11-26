/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayForm, {ClayInput} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import getCN from 'classnames';
import React from 'react';
import {useDrag, useDrop} from 'react-dnd';

import DropZone from './DropZone';
import {ITEM_TYPES} from './itemTypes';

/**
 * Props are calculated in the `useInputSets` function `_getInputSetItemProps`.
 * @see {@link useInputSets#_getInputSetItemProps}
 */
function Item({
	centerIcons = true,
	children,
	index,
	isLastItem,
	noGap = false,
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
		<>
			<DropZone
				index={index}
				isOverItem={isOver}
				move={onInputSetItemMove}
				noGap={noGap}
				paddingStyle={noGap ? '0' : '10px 0'}
			/>

			<ClayForm.Group
				className={getCN(
					'c-mb-0 c-pl-2 c-pr-2',
					'input-sets-item-form-group input-sets-item-root',
					'list-group-item',
					{rounded: !noGap},
					{'rounded-bottom': isLastItem}
				)}
				ref={(node) => dragPreview(drop(node))}
			>
				<ClayInput.Group>
					<ClayInput.GroupItem
						className={getCN({'c-m-md-auto': centerIcons})}
						ref={drag}
						shrink
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
					</ClayInput.GroupItem>

					{children}

					<ClayInput.GroupItem
						className={getCN({'c-m-md-auto': centerIcons})}
						shrink
					>
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
					</ClayInput.GroupItem>
				</ClayInput.Group>
			</ClayForm.Group>

			{isLastItem && (
				<DropZone
					index={index + 1}
					move={onInputSetItemMove}
					noGap={noGap}
					paddingStyle={noGap ? '0 0 20px 0' : '10px 0'}
				/>
			)}
		</>
	);
}

export default Item;
