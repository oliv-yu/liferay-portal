/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayPanel from '@clayui/panel';
import React, {useEffect, useRef, useState} from 'react';

export function FacetCheckbox({
	id,
	index,
	isSelected,
	item,
	onChange,
	parameterName,
}) {
	return (
		<li className="facet-value" key={index}>
			<div className="custom-checkbox custom-control">
				<label
					className="facet-checkbox-label"
					htmlFor={`${parameterName}_${name}_term_${index}_${id}`}
				>
					<input
						checked={isSelected}
						className="custom-control-input facet-term"
						id={`${parameterName}_${name}_term_${index}_${id}`}
						onChange={() => onChange(item.term)}
						type="checkbox"
					/>

					<span className="custom-control-label term-name">
						<span className="custom-control-label-text">
							{isSelected ? (
								<strong>{item.displayName}</strong>
							) : (
								item.displayName
							)}
						</span>

						{!!item.frequency && `(${item.frequency})`}
					</span>
				</label>
			</div>
		</li>
	);
}

export default function SearchFacetFragment({
	parameterName = 'q',
	name = 'type',
	aggregationName = '',
	attributes = {},
	frequencyThreshold = '',
	maxTerms = '',
}) {
	const [facets, setFacets] = useState([]);
	const [selected, setSelected] = useState([]);

	const requestRef = useRef(null); // Contains properties to be listened by the search results
	const resourceRef = useRef(null); // Listens to fetched data from the search results

	const randomId = Math.random().toString(5);

	const _handleClear = () => {
		_dispatchSelectedChange([]);
	};

	const _handleSelect = (value) => {
		_dispatchSelectedChange(
			selected.includes(value)
				? selected.filter((item) => item !== value)
				: [...selected, value]
		);
	};

	const _dispatchSelectedChange = (newSelected) => {
		setSelected(newSelected);

		requestRef.current.value = JSON.stringify({
			aggregationName,
			attributes,
			frequencyThreshold,
			maxTerms,
			values: newSelected,
		});

		requestRef.current.dispatchEvent(new Event('change'));
	};

	useEffect(() => {
		const facetResource = resourceRef.current;

		const _handleChange = (event) => {
			try {
				const parsedFacet = event.target.value
					? JSON.parse(event.target.value)
					: [];

				setFacets(parsedFacet);
			}
			catch (error) {
				console.error(error);
			}
		};

		facetResource.addEventListener('change', _handleChange);

		return () => {
			facetResource.removeEventListener('change', _handleChange);
		};
	}, [name, parameterName]);

	return (
		<>
			<ClayPanel
				collapsable
				defaultExpanded={true}
				displayTitle={name}
				displayType="secondary"
			>
				<ClayPanel.Body>
					{!!selected.length && (
						<ClayButton
							className="c-mb-4 c-p-0"
							displayType="link"
							onClick={_handleClear}
							size="sm"
						>
							<strong>{Liferay.Language.get('clear-all')}</strong>
						</ClayButton>
					)}

					<ul className="list-unstyled">
						{facets.map((item, index) => (
							<FacetCheckbox
								id={randomId}
								index={index}
								isSelected={selected.includes(item.term)}
								item={item}
								key={index}
								onChange={_handleSelect}
								parameterName={parameterName}
							/>
						))}

						{selected.map((item, index) => {
							if (!facets.find((facet) => facet.term === item)) {
								return (
									<FacetCheckbox
										id={randomId}
										index={index}
										isSelected={true}
										item={{
											displayName: item,
											frequency: 0,
											term: item,
										}}
										key={index}
										onChange={_handleSelect}
										parameterName={parameterName}
									/>
								);
							}
						})}
					</ul>
				</ClayPanel.Body>
			</ClayPanel>

			<input
				className={`${parameterName}-search-results-facets-request`}
				name={name}
				ref={requestRef}
				type="hidden"
			/>

			<input
				className={`${parameterName}-search-results-facets-resource`}
				name={name}
				ref={resourceRef}
				type="hidden"
			/>
		</>
	);
}
