"""Distance calculations."""

import numpy as np

EARTH_RADIUS_MILES = 3958.8


def distance_to_boxes_miles(boxes: np.ndarray, latitude: float, longitude: float) -> np.ndarray:
    """Return the distance from a point to each (west, south, east, north) box.

    Distance is 0 inside a box. We measure to boxes rather than county centroids
    because a centroid can be far from most of a county. Riverside County's sits
    in the desert about 100 miles east of the city of Riverside.
    """
    nearest_lon = np.radians(np.clip(longitude, boxes[:, 0], boxes[:, 2]))
    nearest_lat = np.radians(np.clip(latitude, boxes[:, 1], boxes[:, 3]))
    lat = np.radians(latitude)
    lon = np.radians(longitude)
    a = (
        np.sin((nearest_lat - lat) / 2) ** 2
        + np.cos(lat) * np.cos(nearest_lat) * np.sin((nearest_lon - lon) / 2) ** 2
    )
    return 2 * EARTH_RADIUS_MILES * np.arcsin(np.sqrt(a))
