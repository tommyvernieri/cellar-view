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
		<div class="wine-list">
			<xsl:for-each select="$wines-in-stock[count(. | key('wines-by-type-group', TypeGroup)[1]) = 1]">
				<xsl:sort select="TypeGroupSortOrder" data-type="number" />
				
				<xsl:variable name="current-type-group" select="TypeGroup" />
				
				<div class="type-group">
					<xsl:for-each select="$wines-in-stock[TypeGroup = $current-type-group and count(. | key('wines-by-varietal-group', VarietalGroup)[1]) = 1]">
						<xsl:sort select="TypeGroupVarietalSortOrder" data-type="number" />
						<xsl:sort select="VarietalGroup" />
	
						<xsl:variable name="current-varietal-group" select="VarietalGroup" />
						<xsl:variable name="current-varietal-group-position" select="position()" />
	
						<xsl:for-each select="$wines-in-stock[TypeGroup = $current-type-group and VarietalGroup = $current-varietal-group and count(. | key('wines-by-id', iWine)[1]) = 1]">
							<xsl:sort select="SortProducer" />
							<xsl:sort select="Wine" />
							
							<xsl:choose>
									
									<xsl:when test="$current-varietal-group-position = 1 and position() = 1">
										<table class="avoid-break">
											<tbody>
												<tr>
													<td>
														
														<div class="type-heading">
															<xsl:value-of select="TypeGroup" />
														</div>
														
														<div class="varietal-heading">
															<xsl:value-of select="$current-varietal-group" />
														</div>
														
														<xsl:apply-templates select="."/>
														
													</td>
												</tr>
											</tbody>
										</table>
									</xsl:when>

									<xsl:when test="position() = 1">
										<table class="avoid-break">
											<tbody>
												<tr>
													<td>
														
														<div class="varietal-heading">
															<xsl:value-of select="$current-varietal-group" />
														</div>
														
														<xsl:apply-templates select="."/>
														
													</td>
												</tr>
											</tbody>
										</table>
									</xsl:when>
									
									<xsl:otherwise>
										<table class="avoid-break">
											<tbody>
												<tr>
													<td>
														
														<xsl:apply-templates select="."/>
														
													</td>
												</tr>
											</tbody>
										</table>
									</xsl:otherwise>
									
							</xsl:choose>
	
						</xsl:for-each>
					</xsl:for-each>
				</div>
			</xsl:for-each>
			<div class="legend">
				<div>&#x25CA; Could benefit from further cellaring</div>
				<div>&#x2302; House quality wine</div>
			</div>
		</div>
	</xsl:template>

	<xsl:template match="row">
		<div class="wine">
			<span class="wine-name-and-locale">
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
					<xsl:call-template name="output-locale">
						<xsl:with-param name="value" select="LocaleAbbreviated" />
					</xsl:call-template>
					<xsl:text>)</xsl:text>
				</span>
			</span>
			<span class="bin-and-price-list">
				<xsl:for-each select="key('wines-by-id', iWine)">
					<xsl:sort select="Bin" data-type="number" />
					<span class="bin">
						<xsl:value-of select="Bin" />
					</span>
					<xsl:if test="not(position() = last())">
						<xsl:text>, </xsl:text>
					</xsl:if>
					<xsl:if test="position() = last() and number(Price) > 0">
						<span class="price-list-item">
							<xsl:text>, </xsl:text>
						</span>
					</xsl:if>
				</xsl:for-each>
				<xsl:if test="number(Price) > 0">
					<span class="price price-list-item">
						<xsl:text>$</xsl:text>
						<xsl:value-of select="ceiling(number(Price))" />
					</span>
				</xsl:if>
			</span>
		</div>
	</xsl:template>
	
	<xsl:template name="output-locale">
		<xsl:param name="value" />
		
		<xsl:variable name="first" select="substring-before($value, ', ')" /> 
		<xsl:variable name="remaining" select="substring-after($value, ', ')" /> 
		
		<xsl:choose>
			<xsl:when test="$value and not($first)">
				<xsl:call-template name="output-locale-section">
					<xsl:with-param name="value" select="$value" />
				</xsl:call-template>
			</xsl:when>

			<xsl:when test="$first">
				<xsl:call-template name="output-locale-section">
					<xsl:with-param name="value" select="$first" />
				</xsl:call-template>
				<xsl:text>, </xsl:text>
			</xsl:when>
		</xsl:choose>
		
		<xsl:if test="$remaining">
				<xsl:call-template name="output-locale">
								<xsl:with-param name="value" select="$remaining" /> 
				</xsl:call-template>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="output-locale-section">
		<xsl:param name="value" />
		
		<xsl:variable name="first" select="substring-before($value, ' ')" /> 
		<xsl:variable name="remaining" select="substring-after($value, ' ')" /> 
		
		<xsl:choose>
			<xsl:when test="$value and not($first)">
				<xsl:value-of select="$value" />
			</xsl:when>

			<xsl:when test="$first">
				<xsl:value-of select="$first" />
				<xsl:text disable-output-escaping="yes">&#160;</xsl:text>
			</xsl:when>
		</xsl:choose>
		
		<xsl:if test="$remaining">
				<xsl:call-template name="output-locale-section">
								<xsl:with-param name="value" select="$remaining" /> 
				</xsl:call-template>
		</xsl:if>
	</xsl:template>
	
</xsl:stylesheet>
