<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet
	version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	>
	
	<xsl:output method="xml" indent="yes"/>

	<xsl:template match="row">
		<xsl:copy>
			<xsl:apply-templates select="@* | node()"/>
			<TypeGroup><xsl:apply-templates mode="type-group" select="." /></TypeGroup>
			<TypeGroupSortOrder><xsl:apply-templates mode="type-group-sort-order" select="." /></TypeGroupSortOrder>
			<VarietalGroup><xsl:apply-templates mode="varietal-group" select="." /></VarietalGroup>
			<TypeGroupVarietalSortOrder><xsl:apply-templates mode="type-group-varietal-sort-order" select="." /></TypeGroupVarietalSortOrder>
			<LocaleAbbreviated><xsl:apply-templates mode="locale-abbreviated" select="." /></LocaleAbbreviated>
		</xsl:copy>
	</xsl:template>
	
	<xsl:template mode="type-group"
		match="row
		[
			Type = 'White - Sparkling' or
			Type = 'Rosé - Sparkling' or
			Type = 'Red - Sparkling' or
			Type = 'Rosé' or
			Type = 'White' or
			Type = 'White - Off-dry'
		]"
		>
		<xsl:value-of select="'Sparkling, Rosé, and White Wines'"/>
	</xsl:template>
	
	<xsl:template mode="type-group"
		match="row
		[
			Type = 'Red'
		]"
		>
		<xsl:value-of select="'Red Wines'"/>
	</xsl:template>
	
	<xsl:template mode="type-group"
		match="row
		[
			Type = 'White - Sweet/Dessert' or
			Type = 'Rosé - Sweet/Dessert' or
			Type = 'Red - Sweet/Dessert'
		]"
		>
		<xsl:value-of select="'Dessert Wines'"/>
	</xsl:template>
	
	<xsl:template mode="type-group"
		match="row
		[
			Type = 'White - Fortified' or
			Type = 'Red - Fortified' or
			Type = 'Fruit/Vegetable Wine' or
			Type = 'Sake' or
			Type = 'Spirits' or
			Type = 'Liqueur' or
			Type = 'Non-alcoholic'
		]"
		>
		<xsl:value-of select="'Other'"/>
	</xsl:template>
	
	<xsl:template mode="type-group" match="row">
		<xsl:value-of select="Type"/>
	</xsl:template>
	
	<xsl:template mode="type-group-sort-order" match="row">
		<xsl:choose>
			<xsl:when test="Type = 'White - Sparkling'"><xsl:value-of select="1"/></xsl:when>
			<xsl:when test="Type = 'Rosé - Sparkling'"><xsl:value-of select="2"/></xsl:when>
			<xsl:when test="Type = 'Red - Sparkling'"><xsl:value-of select="3"/></xsl:when>
			<xsl:when test="Type = 'Rosé'"><xsl:value-of select="4"/></xsl:when>
			<xsl:when test="Type = 'White'"><xsl:value-of select="5"/></xsl:when>
			<xsl:when test="Type = 'White - Off-dry'"><xsl:value-of select="6"/></xsl:when>
			<xsl:when test="Type = 'Red'"><xsl:value-of select="7"/></xsl:when>
			<xsl:when test="Type = 'White - Sweet/Dessert'"><xsl:value-of select="8"/></xsl:when>
			<xsl:when test="Type = 'Rosé - Sweet/Dessert'"><xsl:value-of select="9"/></xsl:when>
			<xsl:when test="Type = 'Red - Sweet/Dessert'"><xsl:value-of select="10"/></xsl:when>
			<xsl:when test="Type = 'White - Fortified'"><xsl:value-of select="11"/></xsl:when>
			<xsl:when test="Type = 'Red - Fortified'"><xsl:value-of select="12"/></xsl:when>
			<xsl:when test="Type = 'Fruit/Vegetable Wine'"><xsl:value-of select="13"/></xsl:when>
			<xsl:when test="Type = 'Sake'"><xsl:value-of select="14"/></xsl:when>
			<xsl:when test="Type = 'Spirits'"><xsl:value-of select="15"/></xsl:when>
			<xsl:when test="Type = 'Liqueur'"><xsl:value-of select="16"/></xsl:when>
			<xsl:when test="Type = 'Non-alcoholic'"><xsl:value-of select="17"/></xsl:when>
			<xsl:otherwise><xsl:value-of select="18"/></xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template mode="varietal-group"
		match="row
		[
			Type = 'Rosé'
		]"
		>
		<xsl:apply-templates mode="varietal-group-suffix" select=".">
			<xsl:with-param name="varietal-group-base" select="'Rosé'" />
		</xsl:apply-templates>
	</xsl:template>
	
	<xsl:template mode="varietal-group"
		match="row
		[
			Type = 'White'
			and
			(
				MasterVarietal = 'White Rhone Blend' or
				MasterVarietal = 'Pinot Gris-Pinot Blanc Blend'
			)
		]"
		>
		<xsl:apply-templates mode="varietal-group-suffix" select=".">
			<xsl:with-param name="varietal-group-base" select="'White Blend'" />
		</xsl:apply-templates>
	</xsl:template>
	
	<xsl:template mode="varietal-group"
		match="row
		[
			Type = 'Red'
			and
			(
				MasterVarietal = 'Cabernet-Syrah Blend'
			)
		]"
		>
		<xsl:apply-templates mode="varietal-group-suffix" select=".">
			<xsl:with-param name="varietal-group-base" select="'Red Blend'" />
		</xsl:apply-templates>
	</xsl:template>
	
	<xsl:template mode="varietal-group"
		match="row
		[
			Type = 'Red'
			and
			(
				MasterVarietal = 'Red Bordeaux Blend'
			)
		]"
		>
		<xsl:apply-templates mode="varietal-group-suffix" select=".">
			<xsl:with-param name="varietal-group-base" select="'Red Blend - Bordeaux'" />
		</xsl:apply-templates>
	</xsl:template>
	
	<xsl:template mode="varietal-group"
		match="row
		[
			Type = 'Red'
			and
			(
				MasterVarietal = 'SuperTuscan Blend'
			)
		]"
		>
		<xsl:apply-templates mode="varietal-group-suffix" select=".">
			<xsl:with-param name="varietal-group-base" select="'Red Blend - SuperTuscan'" />
		</xsl:apply-templates>
	</xsl:template>
	
	<xsl:template mode="varietal-group" match="row">
		<xsl:apply-templates mode="varietal-group-suffix" select=".">
			<xsl:with-param name="varietal-group-base" select="MasterVarietal" />
		</xsl:apply-templates>
	</xsl:template>
	
	<xsl:template mode="varietal-group-suffix"
		match="row
		[
			Type = 'White - Sparkling' or
			Type = 'Rosé - Sparkling' or
			Type = 'Red - Sparkling'
		]"
		>
		<xsl:param name="varietal-group-base" />
		<xsl:value-of select="'Sparkling'" />
	</xsl:template>
	
	<xsl:template mode="varietal-group-suffix" match="row">
		<xsl:param name="varietal-group-base" />
		<xsl:value-of select="$varietal-group-base" />
	</xsl:template>
	
	<xsl:template mode="type-group-varietal-sort-order" match="row">
		<xsl:choose>
			<xsl:when test="Type = 'White - Sparkling'"><xsl:value-of select="1"/></xsl:when>
			<xsl:when test="Type = 'Rosé - Sparkling'"><xsl:value-of select="1"/></xsl:when>
			<xsl:when test="Type = 'Red - Sparkling'"><xsl:value-of select="1"/></xsl:when>
			<xsl:when test="Type = 'Rosé'"><xsl:value-of select="2"/></xsl:when>
			<xsl:when test="Type = 'White'"><xsl:value-of select="3"/></xsl:when>
			<xsl:when test="Type = 'White - Off-dry'"><xsl:value-of select="3"/></xsl:when>
			<xsl:when test="Type = 'Red'"><xsl:value-of select="4"/></xsl:when>
			<xsl:when test="Type = 'White - Sweet/Dessert'"><xsl:value-of select="5"/></xsl:when>
			<xsl:when test="Type = 'Rosé - Sweet/Dessert'"><xsl:value-of select="5"/></xsl:when>
			<xsl:when test="Type = 'Red - Sweet/Dessert'"><xsl:value-of select="6"/></xsl:when>
			<xsl:when test="Type = 'White - Fortified'"><xsl:value-of select="7"/></xsl:when>
			<xsl:when test="Type = 'Red - Fortified'"><xsl:value-of select="8"/></xsl:when>
			<xsl:when test="Type = 'Fruit/Vegetable Wine'"><xsl:value-of select="9"/></xsl:when>
			<xsl:when test="Type = 'Sake'"><xsl:value-of select="9"/></xsl:when>
			<xsl:when test="Type = 'Spirits'"><xsl:value-of select="9"/></xsl:when>
			<xsl:when test="Type = 'Liqueur'"><xsl:value-of select="9"/></xsl:when>
			<xsl:when test="Type = 'Non-alcoholic'"><xsl:value-of select="9"/></xsl:when>
			<xsl:otherwise><xsl:value-of select="10"/></xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template mode="locale-abbreviated"
		match="row
		[
			Country = 'USA' and
			Region = 'California' and
			SubRegion = 'Unknown'
		]"
		>
		<xsl:value-of select="'California'" />
	</xsl:template>
	
	<xsl:template mode="locale-abbreviated"
		match="row
		[
			Country = 'USA' and
			Region = 'California' and
			SubRegion != 'Unknown' and
			not(boolean(Appellation/text()))
		]"
		>
		<xsl:value-of select="SubRegion" />
	</xsl:template>
	
	<xsl:template mode="locale-abbreviated"
		match="row
		[
			Country = 'USA' and
			Region = 'California' and
			SubRegion != 'Unknown' and
			boolean(Appellation/text())
		]"
		>
		<xsl:value-of select="concat(SubRegion,', ',Appellation)" />
	</xsl:template>
	
	<xsl:template mode="locale-abbreviated"
		match="row
		[
			Country = 'USA' and
			Region != 'California' and
			boolean(Region/text())
		]"
		>
		<xsl:value-of select="substring(Locale,string-length('USA, ') + 1)" />
	</xsl:template>
	
	<xsl:template mode="locale-abbreviated"
		match="row
		[
			Country = 'France' and
			Region != 'France'
		]"
		>
		<xsl:value-of select="substring(Locale,string-length('France, ') + 1)" />
	</xsl:template>
	
	<xsl:template mode="locale-abbreviated"
		priority="1"
		match="row
		[
			Locale = 'USA, California, Central Coast, Santa Rita Hills - Sta. Rita Hills'
		]"
		>
		<xsl:value-of select="'Central Coast, Sta. Rita Hills'" />
	</xsl:template>
	
	<xsl:template mode="locale-abbreviated" match="row">
		<xsl:value-of select="Locale" />
	</xsl:template>
	
	<xsl:template match="@* | node()">
		<xsl:copy>
			<xsl:apply-templates select="@* | node()"/>
		</xsl:copy>
	</xsl:template>

</xsl:stylesheet>
