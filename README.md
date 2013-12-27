D3CalendarView Qlikview Extension
================================================================================ 
Use this QlikView Extension is the perfect choice if you want to display a lot of data on a day-per-day basis. The data passed to the extension is displayed in a diverging color scale.
The values are visualized as colored cells per day. Days are arranged into columns by week, then grouped by month and years.

Screenshots
--------------------------------------------------------------------------------

**D3CalendarView QlikView Extension in Action:**  
![Example 1](https://raw.github.com/stefanwalther/QlikView-Extension-D3CalendarView/master/gh-pages/D3CalendarView_Example1.png)

![Example 2](https://raw.github.com/stefanwalther/QlikView-Extension-D3CalendarView/master/gh-pages/D3CalendarView_Example2.png)

**Configuration Dialog:**  
![Configuration Dialog for D3CalendarView QlikView Extension](https://raw.github.com/stefanwalther/QlikView-Extension-D3CalendarView/master/gh-pages/Configuration.png)

Installation & Configuration
--------------------------------------------------------------------------------

Installation of the QlikView Extension is straightforward, there is nothing special to take care of:

* [Download the extension](https://github.com/stefanwalther/QlikView-Extension-D3CalendarView/raw/master/Install/D3CalendarView_Latest.qar) + [Sample QlikView application](https://github.com/stefanwalther/QlikView-Extension-D3CalendarView/raw/master/Demo/D3CalendarView_v1.0.0.qvw)
* Install the extension on your local computer (doubleclick the .qar file)
* Drag’n’Drop the extension within QlikView Desktop (using WebView)
* Finally deploy the extension to your server (-> [detailed instruction](http://www.qlikblog.at/1597/qliktip-40-installingdeploying-qlikview-extensions/))

### Configuration

| Property       | Type      | Description                                   |
| -------------- | ------    | --------------------------------------------- |
|  Unique Day    |  Date     | Format: YYYY-MM-DD                            |
|  Value         |  Numeric  | Numeric value for the given day               |
|  ToolTip       |  String   | String value to be used by the ToolTip        |
|  Max Years     |  Integer  | Limit the years to be rendered (default = 10) |


Additional Information
--------------------------------------------------------------------------------
### Change Log

* See [Change Log](https://github.com/stefanwalther/QlikView-Extension-D3CalendarView/blob/gh-pages/CHANGELOG.md)

### Possible Improvements
* Implement different color schemas
* Currently you can only select a single day, I could imagine that it would be helpful to select also weeks and months
* Display a color-legend


### License

The software is made available "AS IS" without any warranty of any kind under the MIT License (MIT).
Since this is a private project QlikTech support agreement does not cover support for this software.

[Additional license information for this solution.](https://github.com/stefanwalther/QlikView-Extension-D3CalendarView/blob/gh-pages/LICENSE.md)
