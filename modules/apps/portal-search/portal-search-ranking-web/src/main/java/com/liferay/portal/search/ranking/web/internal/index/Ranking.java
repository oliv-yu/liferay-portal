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

package com.liferay.portal.search.ranking.web.internal.index;

import com.liferay.portal.kernel.util.ListUtil;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author Bryan Engler
 */
public class Ranking {

	public Ranking(Ranking ranking) {
		_aliases = new ArrayList<>(ranking._aliases);
		_blockIds = new HashSet<>(ranking._blockIds);
		_displayDate = ranking._displayDate;
		_id = ranking._id;
		_index = ranking._index;
		_modifiedDate = ranking._modifiedDate;
		_pinIds = new HashSet<>(ranking._pinIds);
		_pins = new ArrayList<>(ranking._pins);
		_queryString = ranking._queryString;
		_status = ranking._status;
	}

	public List<String> getAliases() {
		return Collections.unmodifiableList(_aliases);
	}

	public Collection<String> getAllQueryStrings() {
		List<String> list = new ArrayList<>();

		if (_queryString != null) {
			list.add(_queryString);
		}

		list.addAll(_aliases);

		return list;
	}

	public List<String> getBlockIds() {
		return new ArrayList<>(_blockIds);
	}

	public Date getDisplayDate() {
		return _displayDate;
	}

	public String getId() {
		return _id;
	}

	public String getIndex() {
		return _index;
	}

	public Date getModifiedDate() {
		return _modifiedDate;
	}

	public List<Pin> getPins() {
		return Collections.unmodifiableList(_pins);
	}

	public String getQueryString() {
		return _queryString;
	}

	public int getStatus() {
		return _status;
	}

	public boolean isPinned(String id) {
		return _pinIds.contains(id);
	}

	public static class Pin {

		public Pin(int position, String id) {
			_position = position;
			_id = id;
		}

		public String getId() {
			return _id;
		}

		public int getPosition() {
			return _position;
		}

		private final String _id;
		private final int _position;

	}

	public static class RankingBuilder {

		public RankingBuilder() {
			_ranking = new Ranking();
		}

		public RankingBuilder(Ranking ranking) {
			_ranking = ranking;
		}

		public RankingBuilder aliases(String... aliases) {
			_ranking._aliases = ListUtil.toList(aliases);

			return this;
		}

		public RankingBuilder blocks(List<String> hiddenIds) {
			_ranking._blockIds = new HashSet<>(toList(hiddenIds));

			return this;
		}

		public Ranking build() {
			return new Ranking(_ranking);
		}

		public RankingBuilder id(String id) {
			_ranking._id = id;

			return this;
		}

		public RankingBuilder index(String index) {
			_ranking._index = index;

			return this;
		}

		public RankingBuilder pins(List<Pin> pins) {
			_ranking._pins = toList(pins);
			_ranking._pinIds = pins.stream(
			).map(
				Pin::getId
			).collect(
				Collectors.toSet()
			);

			return this;
		}

		public RankingBuilder queryString(String queryString) {
			_ranking._queryString = queryString;

			return this;
		}

		public RankingBuilder setDisplayDate(Date displayDate) {
			_ranking._displayDate = displayDate;

			return this;
		}

		public RankingBuilder setModifiedDate(Date modifiedDate) {
			_ranking._modifiedDate = modifiedDate;

			return this;
		}

		public RankingBuilder status(int status) {
			_ranking._status = status;

			return this;
		}

		protected static <T, V extends T> List<T> toList(List<V> list) {
			if (list != null) {
				return new ArrayList<>(list);
			}

			return new ArrayList<>();
		}

		private final Ranking _ranking;

	}

	private Ranking() {
	}

	private List<String> _aliases = new ArrayList<>();
	private Set<String> _blockIds = new HashSet<>();
	private Date _displayDate;
	private String _id;
	private String _index;
	private Date _modifiedDate;
	private Set<String> _pinIds = new HashSet<>();
	private List<Pin> _pins = new ArrayList<>();
	private String _queryString;
	private int _status;

}