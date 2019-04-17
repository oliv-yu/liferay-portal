export function getMockResultsData(
	size = 10,
	startId = 0,
	level = 100,
	searchBarTerm = '',
	hidden = false,
	properties = {}
) {
	const mockData = [];

	const PINNED_AMOUNT = 5;

	for (let i = 0; i < size; i++) {
		const typeOfItem = i % 2 === 0 ? 'Document' : 'Web Content';

		const k = searchBarTerm === '' ? i + startId : (i + startId) * 2;

		mockData.push(
			{
				author: 'Test Test',
				clicks: k + level,
				date: 'Apr 18 2018, 11:04 AM',
				description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
				extension:
					typeOfItem === 'Document' ? 'pdf' : null,
				hidden: hidden,
				id: k + level,
				pinned: hidden ? false : k < PINNED_AMOUNT,
				title: `${k + level} This is a ${typeOfItem} Example`,
				type: typeOfItem,
				...properties
			}
		);
	}

	return {
		documents: mockData,
		total: 50
	};
}

/**
 * Mocks a single document result.
 * @param {number} id The id of the document result.
 * @param {Object} properties The properties to add or override.
 * @return {Object} The document result object.
 */
export function mockDocument(id = 1, properties) {
	return (
		{
			author: 'Test Author',
			clicks: 123,
			date: 'Apr 18 2018, 11:04 AM',
			description: 'This is a test description.',
			extension: 'pdf',
			hidden: false,
			id,
			pinned: false,
			title: 'Test Title',
			type: 'Document',
			...properties
		}
	);
}