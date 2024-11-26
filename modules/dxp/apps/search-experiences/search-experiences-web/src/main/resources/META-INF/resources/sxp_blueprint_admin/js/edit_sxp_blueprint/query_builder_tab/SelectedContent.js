/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayEmptyState from '@clayui/empty-state';
import {ClayInput} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import ClayLabel from '@clayui/label';
import ClayLayout from '@clayui/layout';
import ClayList from '@clayui/list';
import ClaySticker from '@clayui/sticker';
import {fetch, openSelectionModal} from 'frontend-js-web';
import moment from 'moment';
import React, {useContext} from 'react';

import ThemeContext from '../../shared/ThemeContext';
import InputSets from '../../shared/input_sets';
import DropZone from '../../shared/input_sets/DropZone';
import {move} from '../../shared/input_sets/useInputSets';
import {openErrorToast} from '../../utils/toasts';

const STATUS_MAP = {
	available: {
		displayType: 'success',
		label: Liferay.Language.get('available'),
	},
	deleted: {
		displayType: 'primary',
		label: Liferay.Language.get('in-recycle-bin'),
	},
	draft: {displayType: 'secondary', label: Liferay.Language.get('draft')},
	missing: {
		displayType: 'primary',
		label: Liferay.Language.get('missing'),
	},
};

const SYMBOLS_MAP = {
	['Blogs Entry']: 'blogs',
	DEFAULT: 'web-content',
	['Document']: 'document',
	['Web Content Article']: 'web-content',
};

function ContentList({
	content,
	onAddItems,
	onInputSetItemDelete,
	onInputSetItemMove,
}) {
	return (
		<InputSets>
			<ClayList.Item flex>
				<ClayList.ItemField expand></ClayList.ItemField>

				<ClayList.ItemField>
					<ClayButton onClick={onAddItems}>
						<ClayIcon className="c-mr-2" symbol="plus" />

						{Liferay.Language.get('add-item')}
					</ClayButton>
				</ClayList.ItemField>
			</ClayList.Item>

			{content.map((item, index) => {
				return (
					<InputSets.Item
						centerIcons={true}
						index={index}
						isLastItem={index === content.length - 1}
						key={item.id}
						noGap={true}
						onInputSetItemDelete={onInputSetItemDelete}
						onInputSetItemMove={onInputSetItemMove}
					>
						<ClayInput.GroupItem shrink>
							<ClaySticker displayType="secondary">
								<ClayIcon
									symbol={
										SYMBOLS_MAP[item.type] ||
										SYMBOLS_MAP.DEFAULT
									}
								/>
							</ClaySticker>
						</ClayInput.GroupItem>

						<ClayInput.GroupItem>
							<ClayList.ItemField>
								<ClayList.ItemTitle>
									<span className="text-truncate-inline">
										{item.title}
									</span>
								</ClayList.ItemTitle>

								<ClayList.ItemText>
									<span>
										{item.site}

										{item.modifiedDate &&
											` - ${item.modifiedDate}`}
									</span>
								</ClayList.ItemText>

								{item.type && (
									<ClayList.ItemText>{`[${item.type}]`}</ClayList.ItemText>
								)}

								{item.status && (
									<ClayList.ItemText>
										<ClayLabel
											displayType={
												STATUS_MAP[item.status]
													.displayType
											}
										>
											{STATUS_MAP[item.status].label}
										</ClayLabel>
									</ClayList.ItemText>
								)}
							</ClayList.ItemField>
						</ClayInput.GroupItem>
					</InputSets.Item>
				);
			})}

			<div className="align-items-center d-flex justify-content-center">
				<ClayButton displayType="secondary" onClick={() => {}}>
					{Liferay.Language.get('load-more')}
				</ClayButton>
			</div>
		</InputSets>
	);
}

function ContentTable({
	content,
	onAddItems,
	onInputSetItemDelete,
	onInputSetItemMove,
}) {
	const formatUTCDate = (value) => {
		return moment
			.utc(value)
			.locale(Liferay.ThemeDisplay.getBCP47LanguageId())
			.fromNow();
	};

	return (
		<InputSets>
			<table className="table table-bordered table-hover table-nowrap">
				<thead>
					<tr>
						<th colSpan="7">
							<div className="d-flex justify-content-end">
								<ClayButton
									className="c-m-2"
									onClick={onAddItems}
								>
									<ClayIcon
										className="c-mr-2"
										symbol="plus"
									/>

									{Liferay.Language.get('add-item')}
								</ClayButton>
							</div>
						</th>
					</tr>

					<tr>
						<th></th>

						<th className="table-cell-expand-small table-head-title">
							<span className="inline-item">
								{Liferay.Language.get('title')}
							</span>
						</th>

						<th className="table-cell-expand-smaller table-head-title">
							<span className="inline-item">
								{Liferay.Language.get('type')}
							</span>
						</th>

						<th className="table-cell-expand-smaller table-head-title">
							<span className="inline-item">
								{Liferay.Language.get('site')}
							</span>
						</th>

						<th className="table-cell-expand-smaller table-head-title">
							<span className="inline-item">
								{Liferay.Language.get('status')}
							</span>
						</th>

						<th className="table-cell-expand-smaller table-head-title">
							<span className="inline-item">
								{Liferay.Language.get('modified-date')}
							</span>
						</th>

						<th></th>
					</tr>
				</thead>

				<tbody>
					{content.map((item, index) => {
						return (
							<InputSets.TableItem
								index={index}
								key={item.id}
								onInputSetItemDelete={onInputSetItemDelete}
								onInputSetItemMove={onInputSetItemMove}
							>
								<td className="table-cell-expand-small">
									<div className="table-list-title">
										{item.title}
									</div>
								</td>

								<td className="table-cell-expand-smaller">
									{item.type}
								</td>

								<td className="table-cell-expand-smaller">
									{item.site}
								</td>

								<td className="table-cell-expand-smaller">
									<ClayLabel
										displayType={
											STATUS_MAP[item.status].displayType
										}
									>
										{STATUS_MAP[item.status].label}
									</ClayLabel>
								</td>

								<td className="table-cell-expand-smaller">
									{formatUTCDate(item.modifiedDate)}
								</td>
							</InputSets.TableItem>
						);
					})}
				</tbody>
			</table>

			{/* Necessary to place a DropZone for last index after table */}

			<DropZone
				index={content.length}
				move={onInputSetItemMove}
				noGap={true}
				paddingStyle="0 0 20px 0"
			/>

			<div className="align-items-center d-flex justify-content-center">
				<ClayButton displayType="secondary" onClick={() => {}}>
					{Liferay.Language.get('load-more')}
				</ClayButton>
			</div>
		</InputSets>
	);
}

export default function SelectedContent({
	content = [],
	onChangeContent = () => {},
}) {
	const {namespace, selectInfoItemsURL} = useContext(ThemeContext);

	const _handleInputSetItemDelete = (index) => () => {
		onChangeContent(content.filter((_, i) => i !== index));
	};

	const _handleInputSetItemMove = (from, to) => {
		onChangeContent(move(content, from, to));
	};

	const _handleSelectItems = () => {
		openSelectionModal({
			height: '60vh',
			onSelect: (selection) => {
				let infoItem = {
					...selection,
				};

				let value;

				if (selection.value) {
					if (typeof selection.value === 'string') {
						try {
							value = JSON.parse(selection.value);
						}
						catch (error) {}
					}
					else if (
						selection.value &&
						typeof selection.value === 'object'
					) {
						value = selection.value;
					}

					if (value) {
						delete infoItem.value;
						infoItem = {...infoItem, ...value};
					}
				}
				else if (typeof selection === 'object') {
					infoItem = Object.values(selection)[0];
				}

				console.log('infoItem', infoItem);

				_handleFetchAssetInfo(infoItem);
			},
			selectEventName: `${namespace}selectInfoItem`,
			title: Liferay.Language.get('select'),
			url: selectInfoItemsURL,
		});
	};

	const _handleFetchAssetInfo = (infoItem = {}) => {
		if (!infoItem.assetEntryId && !infoItem.entryId) {
			return;
		}

		return fetch(`/api/jsonws/invoke`, {
			body: new URLSearchParams({
				cmd: JSON.stringify({
					'/assetentry/fetch-entry': {
						entryId: infoItem.assetEntryId || infoItem.entryId,
					},
				}),
				p_auth: Liferay.authToken,
			}),
			headers: new Headers({
				'Accept-Language': Liferay.ThemeDisplay.getBCP47LanguageId(),
				'Content-Type':
					'application/x-www-form-urlencoded;charset=UTF-8',
			}),
			method: 'POST',
		})
			.then((response) => response.json())
			.then((responseContent) => {
				console.log('response', responseContent);

				if (!responseContent) {
					openErrorToast();

					return;
				}

				onChangeContent([
					{
						className: infoItem.className,
						externalReferenceCode: responseContent.classUuid,
						id: infoItem.assetEntryId || infoItem.entryId,
						modifiedDate: responseContent.modifiedDate,
						site: infoItem.groupDescriptiveName,
						status: 'available',
						title:
							infoItem.title || responseContent.titleCurrentValue,
						type: infoItem.type,
					},
					...content,
				]);
			})
			.catch(() => {});
	};

	return (
		<ClayLayout.ContainerFluid
			className="layout-section-main query-builder-tab"
			size="xl"
		>
			<div className="layout-section-main-shift">
				<div className="sheet">
					<div className="sheet-header">
						<div className="sheet-title">
							{Liferay.Language.get('selected-content')}
						</div>
					</div>

					<div className="sheet-section">
						{!content.length ? (
							<ClayEmptyState
								description={Liferay.Language.get(
									'please-add-your-first-item'
								)}
								imgSrc="/o/admin-theme/images/states/success_state.svg"
								title={Liferay.Language.get(
									'no-items-here-yet'
								)}
							>
								<ClayButton
									displayType="secondary"
									onClick={_handleSelectItems}
								>
									{Liferay.Language.get('select')}
								</ClayButton>
							</ClayEmptyState>
						) : (
							<ContentTable
								content={content}
								onAddItems={_handleSelectItems}
								onInputSetItemDelete={_handleInputSetItemDelete}
								onInputSetItemMove={_handleInputSetItemMove}
							/>
						)}
					</div>
				</div>
			</div>
		</ClayLayout.ContainerFluid>
	);
}
