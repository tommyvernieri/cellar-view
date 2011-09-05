<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet
	version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:msxsl="urn:schemas-microsoft-com:xslt"
	xmlns="http://www.w3.org/1999/xhtml"
	exclude-result-prefixes="msxsl"
	>

	<xsl:output
		method="html"
		indent="yes"
		encoding="utf-8"
		omit-xml-declaration="no"
		doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN"
		doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"
		/>

	<xsl:variable name="wines-in-stock" select="/cellartracker/list/row[Quantity > 0 and Location != 'Wine Fridge - Tasting group']" />
	<xsl:key name="wines-by-type-group" match="/cellartracker/list/row[Quantity > 0 and Location != 'Wine Fridge - Tasting group']" use="TypeGroup" />
	<xsl:key name="wines-by-varietal-group" match="/cellartracker/list/row[Quantity > 0 and Location != 'Wine Fridge - Tasting group']" use="VarietalGroup" />
	<xsl:key name="wines-by-id" match="/cellartracker/list/row[Quantity > 0 and Location != 'Wine Fridge - Tasting group']" use="iWine" />

	<xsl:template match="/cellartracker">
		<html>
			<head>
				<title>Wine List</title>
			</head>
			<body>
				<div class="wine-list">
					<xsl:for-each select="$wines-in-stock[count(. | key('wines-by-type-group', TypeGroup)[1]) = 1]">
						<xsl:sort select="TypeGroupSortOrder" data-type="number" />
						
						<xsl:variable name="current-type-group" select="TypeGroup" />
						
						<div class="type-group">
							<div class="type-heading">
								<xsl:value-of select="TypeGroup" />
							</div>
							<xsl:for-each select="$wines-in-stock[TypeGroup = $current-type-group and count(. | key('wines-by-varietal-group', VarietalGroup)[1]) = 1]">
								<xsl:sort select="TypeGroupVarietalSortOrder" data-type="number" />
								<xsl:sort select="VarietalGroup" />
	
								<xsl:variable name="current-varietal-group" select="VarietalGroup" />
	
								<table class="varietal-group">
									<tr class="varietal-heading">
										<td colspan="2">
											<xsl:value-of select="VarietalGroup" />
										</td>
									</tr>
									<xsl:for-each select="$wines-in-stock[TypeGroup = $current-type-group and VarietalGroup = $current-varietal-group and count(. | key('wines-by-id', iWine)[1]) = 1]">
										<xsl:sort select="SortProducer" />
										<xsl:sort select="Wine" />
	
										<xsl:apply-templates select="." />
									</xsl:for-each>
								</table>
							</xsl:for-each>
						</div>
					</xsl:for-each>
					<div class="legend">
						<div>&#x25CA; Could benefit from further cellaring</div>
						<div>&#x2302; House quality wine</div>
					</div>
				</div>
			</body>
		</html>
	</xsl:template>

	<xsl:template match="row">
		<tr class="wine">
			<td class="wine-name-and-locale">
				<xsl:choose>
					<xsl:when test="Location = 'Wine Fridge - Future'">
						<span class="wine-status-indicator wine-status-future">
							<xsl:text>&#x25CA;</xsl:text>
						</span>
						<xsl:text> </xsl:text>
					</xsl:when>
					<xsl:when test="Location = 'Wine Fridge - House'">
						<span class="wine-status-indicator wine-status-house">
							<xsl:text>&#x2302;</xsl:text>
						</span>
						<xsl:text> </xsl:text>
					</xsl:when>
				</xsl:choose>
				<xsl:if test="Vintage != '1001'">
					<span class="vintage">
						<xsl:value-of select="Vintage"/>
					</span>
					<xsl:text> </xsl:text>
				</xsl:if>
				<span class="wine-name">
					<xsl:value-of select="Wine" />
				</span>
				<xsl:text> </xsl:text>
				<span class="locale">
					<xsl:text>(</xsl:text>
					<xsl:value-of select="LocaleAbbreviated" />
					<xsl:text>)</xsl:text>
				</span>
			</td>
			<td class="bin-and-price-list">
				<xsl:for-each select="key('wines-by-id', iWine)">
					<xsl:sort select="Bin" data-type="number" />
					<span class="bin">
						<xsl:value-of select="Bin" />
					</span>
					<xsl:if test="not(position() = last()) or number(Price) > 0">
						<xsl:text>, </xsl:text>
					</xsl:if>
				</xsl:for-each>
				<xsl:if test="number(Price) > 0">
					<span class="price">
						<xsl:text>$</xsl:text>
						<xsl:value-of select="ceiling(number(Price))" />
					</span>
				</xsl:if>
			</td>
		</tr>
	</xsl:template>
	
</xsl:stylesheet>
