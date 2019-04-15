import {getMockResultsData} from 'test/mock-data.js';

/**
 * Fetches documents.
 * Uses the getMockResultsData in order to mock the fetch formula
 */

export const fetchDocuments = jest.fn(
	(
		url,
		config
	) => {
		const {from, hidden, keywords, size} = config;

		const level = hidden ? 200 : 100;

		const p = Promise.resolve(
			getMockResultsData(
				size,
				from,
				level,
				keywords,
				hidden
			)
		).then(
			data => ({
				items: data.documents,
				total: data.total
			})
		);

		return p;
	}
);