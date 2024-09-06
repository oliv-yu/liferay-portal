/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ClayPaginationBarWithBasicItems} from '@clayui/pagination-bar';
import {addParams, fetch} from 'frontend-js-web';
import React, {useCallback, useEffect, useState} from 'react';

export default function SearchResultFragment({
	blueprintExternalReferenceCode = '',
	emptySearchEnabled = true,
	parameterName = 'q',
}) {
	const [activePage, setActivePage] = useState(1);
	const [delta, setDelta] = useState(8);
	const [resource, setResource] = useState({});

	const searchBarFormClassName = `${parameterName}-searchbar-form`;
	const searchFacetRequestClassName = `${parameterName}-search-results-facets-request`;
	const searchFacetResourceClassName = `${parameterName}-search-results-facets-resource`;

	const deltas = [
		{
			label: 4,
		},
		{
			label: 8,
		},
		{
			label: 20,
		},
		{
			label: 40,
		},
	];

	/*
	 * Gets the most current facet configurations from each
	 * search facet fragment on the page.
	 */
	const _getFacetConfigurations = useCallback(() => {
		const searchFacetTerms = document.getElementsByClassName(
			searchFacetRequestClassName
		);

		const facetConfigurations = [];

		Object.values(searchFacetTerms).forEach(({name, value}) => {
			let props = {};

			try {
				props = value ? JSON.parse(value) : {};
			}
			catch (error) {
				console.error(error);
			}

			facetConfigurations.push({
				name,
				values: [],
				...props,
			});
		});

		return facetConfigurations;
	}, [searchFacetRequestClassName]);

	/*
	 * Gets the searchbar properties from the form passed in.
	 */
	const _getSearchBarProps = useCallback(
		(form) => {
			const formData = new FormData(form);

			const keyword = formData.get(parameterName);
			const scope = formData.get('scope');

			if (scope === 'this-site') {
				return {
					keyword,
					scope: Liferay.ThemeDisplay.getSiteGroupId(),
				};
			}

			return {
				keyword,
			};
		},
		[parameterName]
	);

	const _handleFetch = useCallback(
		({
			activePage,
			delta,
			keyword = '',
			facetConfigurations = [],
			...props
		}) => {
			const searchURL = new URL(
				`${Liferay.ThemeDisplay.getPathContext()}/o/search/v1.0/search`,
				Liferay.ThemeDisplay.getPortalURL()
			);

			if (!emptySearchEnabled && !keyword) {
				return;
			}

			fetch(
				addParams(
					{
						blueprintExternalReferenceCode,
						page: activePage,
						pageSize: delta,
						search: keyword,
						...props,
					},
					searchURL.href
				),
				{
					body: JSON.stringify({
						facetConfigurations,
					}),
					headers: new Headers({
						'Accept': 'application/json',
						'Accept-Language':
							Liferay.ThemeDisplay.getBCP47LanguageId(),
						'Content-Type': 'application/json',
					}),
					method: 'POST',
				}
			)
				.then((response) => response.json())
				.then((resource) => {
					setResource(resource);

					const facetResults = resource?.searchFacets;

					const searchResultFacets = document.getElementsByClassName(
						searchFacetResourceClassName
					);

					// Populate facet results within search facet fragment

					Array.prototype.forEach.call(
						searchResultFacets,
						(facet) => {
							facet.value = JSON.stringify(
								facetResults?.[facet.name] || []
							);
							facet.dispatchEvent(new Event('change'));
						}
					);
				});
		},
		[
			blueprintExternalReferenceCode,
			emptySearchEnabled,
			searchFacetResourceClassName,
		]
	);

	const _handleDeltaChange = (newDelta) => {
		setDelta(newDelta);

		const searchBarForm = document.getElementsByClassName(
			searchBarFormClassName
		)?.[0];

		if (searchBarForm) {
			_handleFetch({
				..._getSearchBarProps(searchBarForm),
				activePage,
				delta: newDelta,
				facetConfigurations: _getFacetConfigurations(),
			});
		}
	};

	const _handlePageChange = (newPage) => {
		setActivePage(newPage);

		const searchBarForm = document.getElementsByClassName(
			searchBarFormClassName
		)?.[0];

		if (searchBarForm) {
			_handleFetch({
				..._getSearchBarProps(searchBarForm),
				activePage: newPage,
				delta,
				facetConfigurations: _getFacetConfigurations(),
			});
		}
	};

	useEffect(() => {
		const searchBarForms = document.getElementsByClassName(
			searchBarFormClassName
		);

		const _handleSubmit = (event) => {
			event.preventDefault();

			setActivePage(1);

			_handleFetch({
				activePage: 1,
				delta,
				facetConfigurations: _getFacetConfigurations(),
				..._getSearchBarProps(event.target),
			});
		};

		Array.prototype.forEach.call(searchBarForms, (searchBarForm) => {
			searchBarForm?.addEventListener('submit', _handleSubmit);

			return () => {
				searchBarForm?.removeEventListener('submit', _handleSubmit);
			};
		});
	}, [
		_handleFetch,
		_getFacetConfigurations,
		_getSearchBarProps,
		searchBarFormClassName,
		activePage,
		delta,
	]);

	useEffect(() => {
		const searchFacets = document.getElementsByClassName(
			searchFacetRequestClassName
		);

		const _handleSelect = () => {
			const searchBarForm = document.getElementsByClassName(
				searchBarFormClassName
			);

			setActivePage(1);

			if (searchBarForm[0]) {
				_handleFetch({
					..._getSearchBarProps(searchBarForm[0]),
					activePage: 1,
					delta,
					facetConfigurations: _getFacetConfigurations(),
				});
			}
		};

		Array.prototype.forEach.call(searchFacets, (facet) => {
			facet.addEventListener('change', _handleSelect);

			return () => {
				facet.removeEventListener('change', _handleSelect);
			};
		});
	}, [
		_getFacetConfigurations,
		_getSearchBarProps,
		_handleFetch,
		delta,
		searchFacetRequestClassName,
		searchBarFormClassName,
	]);

	return (
		<>
			<ul className="border list-group" style={{minHeight: '3rem'}}>
				{!!resource.items?.length &&
					resource.items.map((result, index) => {
						const createDate = new Date(result.dateCreated);

						return (
							<li
								className="list-group-item list-group-item-flex"
								key={index}
							>
								<div className="autofit-col autofit-col-expand">
									<section className="autofit-section">
										<div className="c-mt-0 list-group-title">
											{result.itemURL ? (
												<a href={result.itemURL}>
													{result.title}
												</a>
											) : (
												result.title
											)}
										</div>

										<div className="search-resource-metadata">
											{result.dateCreated && (
												<p className="list-group-subtext">
													<span className="subtext-item">
														{`${Liferay.Language.get(
															'on-date'
														)} ${createDate.toDateString()}`}
													</span>
												</p>
											)}

											{result.description && (
												<p className="list-group-subtext">
													<span className="subtext-item">
														{result.description}
													</span>
												</p>
											)}
										</div>
									</section>
								</div>
							</li>
						);
					})}

				{resource.totalCount === 0 && (
					<li className="list-group-item">
						{Liferay.Language.get('no-results-were-found')}
					</li>
				)}
			</ul>

			{!!resource.items?.length && (
				<ClayPaginationBarWithBasicItems
					activeDelta={delta}
					defaultActive={activePage}
					deltas={deltas}
					ellipsisBuffer={3}
					onActiveChange={_handlePageChange}
					onDeltaChange={_handleDeltaChange}
					totalItems={resource.totalCount || 0}
				/>
			)}
		</>
	);
}
