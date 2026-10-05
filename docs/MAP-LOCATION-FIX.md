# Native map location fix

This patch addresses two separate issues observed in the iOS Simulator.

## Homes missing from the map

The previous map queried properties using the currently selected onboarding county. A valid Nairobi listing therefore disappeared completely when the selected county was Kiambu. Listings with legacy `lat = 0` / `lng = 0` values were also discarded.

The native map now:

- loads a bounded set of active listings across counties;
- prefers the selected county when that county has inventory;
- shows available homes elsewhere when the selected county has no active inventory;
- uses the property's stored latitude/longitude when valid;
- gives legacy listings without coordinates an **approximate county-centre position** so they are not silently removed;
- clearly labels approximate positions in the property card.

Agencies can still enter exact latitude and longitude from **Listing → More details**. Exact coordinates always take priority over the fallback.

## GPS jumping to another country

The iOS Simulator does not automatically use the Mac's real physical GPS location. It can report an Apple test location (commonly in the United States), which previously caused Nyumba to animate the Kenya property map there.

Nyumba now validates the reported coordinate against the supported Kenya map bounds. If the device reports a point outside Kenya, the app keeps the current Kenya map region and explains how to configure the simulator rather than jumping away from the marketplace.

For simulator testing, use:

`Simulator → Features → Location → Custom Location`

For Nairobi, a suitable simulator test coordinate is the same Nairobi centre already used by Nyumba's location dataset:

- Latitude: `-1.2921`
- Longitude: `36.8219`

A physical iPhone continues to use its real location when the user grants location permission and the reported point is within Kenya.
