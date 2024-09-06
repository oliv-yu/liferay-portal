/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.web.internal.type.facet.fragment.renderer;

import com.liferay.fragment.model.FragmentEntryLink;
import com.liferay.fragment.renderer.FragmentRenderer;
import com.liferay.fragment.renderer.FragmentRendererContext;
import com.liferay.fragment.util.configuration.FragmentEntryConfigurationParser;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.json.JSONException;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.ResourceBundleUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.template.react.renderer.ComponentDescriptor;
import com.liferay.portal.template.react.renderer.ReactRenderer;

import java.io.CharArrayWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;

import java.util.Locale;
import java.util.ResourceBundle;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Olivia Yu
 */
@Component(service = FragmentRenderer.class)
public class TypeFacetFragmentRenderer implements FragmentRenderer {

	@Override
	public String getCollectionKey() {
		return "search";
	}

	@Override
	public String getConfiguration(
		FragmentRendererContext fragmentRendererContext) {

		ResourceBundle resourceBundle = ResourceBundleUtil.getBundle(
			"content.Language", getClass());

		try {
			JSONObject jsonObject = _jsonFactory.createJSONObject(
				StringUtil.read(
					getClass(),
					"/com/liferay/portal/search/web/internal/type/facet" +
						"/fragment/renderer/dependencies/configuration.json"));

			return _fragmentEntryConfigurationParser.translateConfiguration(
				jsonObject, resourceBundle);
		}
		catch (JSONException jsonException) {
			if (_log.isDebugEnabled()) {
				_log.debug(jsonException);
			}

			return StringPool.BLANK;
		}
	}

	@Override
	public String getIcon() {
		return "search";
	}

	@Override
	public String getLabel(Locale locale) {
		return _language.get(
			locale, "type-facet-portlet-instance-configuration-name");
	}

	@Override
	public void render(
			FragmentRendererContext fragmentRendererContext,
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse)
		throws IOException {

		PrintWriter printWriter = httpServletResponse.getWriter();

		try {
			printWriter.write(
				_buildFragmentHTML(
					fragmentRendererContext, httpServletRequest));
		}
		catch (Exception exception) {
			_log.error("Unable to render type facet", exception);

			throw new IOException(exception);
		}
	}

	private String _buildFragmentHTML(
			FragmentRendererContext fragmentRendererContext,
			HttpServletRequest httpServletRequest)
		throws Exception {

		StringBundler sb = new StringBundler(5);

		sb.append("<div id=\"");
		sb.append(fragmentRendererContext.getFragmentElementId());
		sb.append("\" >");

		ComponentDescriptor componentDescriptor = new ComponentDescriptor(
			"{SearchFacetFragment} from portal-search-web",
			fragmentRendererContext.getFragmentElementId(), null, true);

		Writer writer = new CharArrayWriter();

		_reactRenderer.renderReact(
			componentDescriptor,
			HashMapBuilder.<String, Object>put(
				"aggregationName",
				GetterUtil.getString(
					_getConfigurationValue(
						fragmentRendererContext.getFragmentEntryLink(),
						"aggregationName"))
			).put(
				"frequencyThreshold",
				GetterUtil.getNumber(
					_getConfigurationValue(
						fragmentRendererContext.getFragmentEntryLink(),
						"frequencyThreshold"))
			).put(
				"maxTerms",
				GetterUtil.getNumber(
					_getConfigurationValue(
						fragmentRendererContext.getFragmentEntryLink(),
						"maxTerms"))
			).put(
				"parameterName",
				GetterUtil.getString(
					_getConfigurationValue(
						fragmentRendererContext.getFragmentEntryLink(),
						"parameterName"))
			).put(
				"type", "type"
			).build(),
			httpServletRequest, writer);

		sb.append(writer.toString());

		sb.append("</div>");

		return sb.toString();
	}

	private Object _getConfigurationValue(
		FragmentEntryLink fragmentEntryLink, String name) {

		return _fragmentEntryConfigurationParser.getFieldValue(
			fragmentEntryLink.getConfiguration(),
			fragmentEntryLink.getEditableValues(),
			LocaleUtil.getMostRelevantLocale(), name);
	}

	private static final Log _log = LogFactoryUtil.getLog(
		TypeFacetFragmentRenderer.class);

	@Reference
	private FragmentEntryConfigurationParser _fragmentEntryConfigurationParser;

	@Reference
	private JSONFactory _jsonFactory;

	@Reference
	private Language _language;

	@Reference
	private ReactRenderer _reactRenderer;

}