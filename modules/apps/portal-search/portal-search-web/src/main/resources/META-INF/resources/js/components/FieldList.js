/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import ClayButton from '@clayui/button';
import ClayForm, {ClayInput} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import React, {useRef} from 'react';
import {DndProvider, useDrag, useDrop} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

export const ITEM_TYPES = {
	FIELD: 'field',
};

export const ORDERS = {
	ASC: {
		label: Liferay.Language.get('ascending'),
		value: 'ascending',
	},
	DESC: {
		label: Liferay.Language.get('descending'),
		value: 'descending',
	},
};

/**
 * Moves an item in an array. Does not mutate the original array.
 * @param {Array} list The list to move an item.
 * @param {number} from The index of the item being moved.
 * @param {number} to The new index that the item will be moved to.
 *  @return {Array} Array of items with new order.
 */
export function move(list, from, to) {
	const listWithInserted = [
		...list.slice(0, to),
		list[from],
		...list.slice(to, list.length),
	];

	const updatedFrom = from > to ? from + 1 : from;

	return listWithInserted.filter((_, index) => index !== updatedFrom);
}

function DropZone({index, move}) {
	const [{isOver}, drop] = useDrop(
		{
			accept: ITEM_TYPES.FIELD,
			collect: (monitor) => ({
				isOver: !!monitor.isOver(),
			}),
			drop: (source) => {
				move(source.index, index);
			},
		},
		[move]
	);

	return (
		<div className="field-drop-zone" ref={drop}>
			{isOver && <div className="field-drop-zone-over" />}
		</div>
	);
}

function Field({children, index, onDelete}) {
	const [{isDragging}, drag] = useDrag({
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
		item: {index, type: ITEM_TYPES.FIELD},
	});

	return (
		<div
			ref={drag}
			style={{
				cursor: 'move',
				opacity: isDragging ? 0.5 : 1,
			}}
		>
			<ClayForm.Group className="field-item">
				<ClayInput.Group>
					<ClayInput.GroupItem shrink>
						<ClayButton
							borderless
							className="drag-handle"
							displayType="secondary"
							monospaced
							small
						>
							<ClayIcon symbol="drag" />
						</ClayButton>
					</ClayInput.GroupItem>

					{children}

					<ClayInput.GroupItem shrink>
						<ClayButton
							borderless
							displayType="secondary"
							monospaced
							onClick={onDelete}
							small
						>
							<ClayIcon symbol="trash" />
						</ClayButton>
					</ClayInput.GroupItem>
				</ClayInput.Group>
			</ClayForm.Group>
		</div>
	);
}

function FieldList({
	addFieldLabel = Liferay.Language.get('add-option'),
	fields,
	initialValue = {},
	inputItems,
	onChangeFields,
}) {
	const idCounterRef = useRef(10000); // Starts at 10000 to avoid conflicts with existing fields.

	const _handleAddField = () => {
		onChangeFields([
			...fields,
			{
				...initialValue,
				id: idCounterRef.current++,
			},
		]);
	};

	const _handleChangeField = (index) => (value) => {
		onChangeFields(
			fields.map((item, i) => (i === index ? {...item, ...value} : item))
		);
	};

	const _handleDeleteField = (index) => {
		onChangeFields(fields.filter((_, i) => i !== index));
	};

	const _handleMoveField = (from, to) => {
		onChangeFields(move(fields, from, to));
	};

	const _handleReplaceField = (index) => (value) => {
		onChangeFields(fields.map((item, i) => (i === index ? value : item)));
	};

	return (
		<div className="field-list">
			<DndProvider backend={HTML5Backend}>
				{fields.map((item, index) => (
					<div key={item.id}>
						<DropZone index={index} move={_handleMoveField} />

						<Field
							index={index}
							onDelete={() => _handleDeleteField(index)}
						>
							{inputItems({
								...item,
								onChange: _handleChangeField(index),
								onReplace: _handleReplaceField(index),
							})}
						</Field>
					</div>
				))}

				<DropZone index={fields.length} move={_handleMoveField} />

				<ClayButton displayType="secondary" onClick={_handleAddField}>
					<span className="inline-item inline-item-before">
						<ClayIcon symbol="plus" />
					</span>

					{addFieldLabel}
				</ClayButton>
			</DndProvider>
		</div>
	);
}

export default FieldList;
