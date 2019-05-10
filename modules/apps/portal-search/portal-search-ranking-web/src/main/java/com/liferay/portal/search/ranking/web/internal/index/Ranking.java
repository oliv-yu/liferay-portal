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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * @author Bryan Engler
 */
public class Ranking {

	public String[] getAliases() {
		return _aliases;
	}

	public Date getDisplayDate() {
		return _displayDate;
	}

	public List<String> getHiddenDocuments() {
		return _hiddenDocuments;
	}

	public String getIndex() {
		return _index;
	}

	public Date getModifiedDate() {
		return _modifiedDate;
	}

	public List<Map<String, String>> getPinnedDocuments() {
		return _pinnedDocuments;
	}

	public String getQueryString() {
		return _queryString;
	}

	public int getStatus() {
		return _status;
	}

	public String getUid() {
		return _uid;
	}

	public void setAliases(String[] aliases) {
		_aliases = aliases;
	}

	public void setDisplayDate(Date displayDate) {
		_displayDate = displayDate;
	}

	public void setHiddenDocuments(List<String> hiddenDocuments) {
		_hiddenDocuments = hiddenDocuments;
	}

	public void setIndex(String index) {
		_index = index;
	}

	public void setModifiedDate(Date modifiedDate) {
		_modifiedDate = modifiedDate;
	}

	public void setPinnedDocuments(List<Map<String, String>> pinnedDocuments) {
		_pinnedDocuments = new ArrayList<>(pinnedDocuments);
	}

	public void setQueryString(String queryString) {
		_queryString = queryString;
	}

	public void setStatus(int status) {
		_status = status;
	}

	public void setUid(String uid) {
		_uid = uid;
	}

	private String[] _aliases;
	private Date _displayDate;
	private List<String> _hiddenDocuments;
	private String _index;
	private Date _modifiedDate;
	private List<Map<String, String>> _pinnedDocuments = new ArrayList<>();
	private String _queryString;
	private int _status;
	private String _uid;

}