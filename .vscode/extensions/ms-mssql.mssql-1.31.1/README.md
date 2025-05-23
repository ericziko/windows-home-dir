[![Build and Test (Unit + E2E)](https://github.com/microsoft/vscode-mssql/actions/workflows/build-and-test.yml/badge.svg?branch=main&event=push)](https://github.com/microsoft/vscode-mssql/actions/workflows/build-and-test.yml)
![GitHub Discussions](https://img.shields.io/github/discussions/microsoft/vscode-mssql)

# MSSQL extension for Visual Studio Code

This extension is designed to help developers seamlessly work with their databases, simplifying the use of SQL Server, SQL Database in Fabric, and all Azure SQL offerings — including Azure SQL Database, Azure SQL Managed Instance, and SQL Server on Azure VMs — as the backend for their applications.
With a rich set of features, the MSSQL extension for Visual Studio Code enhances the development experience, offering functionalities such as:

- **Connect to Microsoft SQL Server and Azure SQL Database**: Seamlessly connect to your databases to manage and query data. The new **Connection Dialog (`Preview`)** offers a more intuitive interface, with options for entering parameters, connection strings, or browsing Azure databases. The Recent Connections panel provides quick access to previously used servers.
- **Create and manage connection profiles**: Easily manage multiple connection profiles and quickly reconnect using your most recently used connections.
- **Enhanced T-SQL Editing Experience**: Write T-SQL scripts with a range of powerful features, including:
  - IntelliSense for faster and more accurate coding.
  - Go to Definition for exploring database objects.
  - T-SQL snippets to speed up repetitive tasks.
  - Syntax colorizations and T-SQL error validations.
  - Support for the `GO` batch separator.
- **Execute queries and View Results (`Preview`)**: Run your scripts and view results in a simple, yet powerful, grid with improved data visualization features:
  - View results in a unified interface alongside the integrated terminal and output panels or in their own tab.
  - Sort results by clicking on column headers.
  - Easily copy results with or without headers for use in other applications.
  - Export results to multiple formats, including JSON, Excel, and CSV.
  - View estimated plan and actual plan for T-SQL queries.
- **Object Explorer (`Preview`)**: Navigate through your database objects, such as databases, tables, views, and programmability items. Enhanced filtering allows you to filter database objects by properties like name, owner, or creation date, making it easier to locate specific objects within large database hierarchies.
- **Table Designer (`Preview`)**: A visual tool for creating and managing tables in your databases. Design every aspect of the table's structure, including:
  - Adding columns, setting data types, and specifying default values.
  - Defining primary keys and managing indexes to improve query performance.
  - Setting up foreign keys to maintain data integrity across tables.
  - Configuring advanced options like check constraints.
  - **Script As Create**: Automatically generate T-SQL scripts for your table design and apply changes directly to the database.
- **Query Plan Visualizer (`Preview`)**: Analyze SQL query performance with detailed execution plans. Key features include:
  - **Node Navigation**: Interact with each step in the execution plan, including collapsing or expanding nodes for a simplified view.
  - **Zoom Controls**: Zoom in or out to adjust the level of detail, or use "zoom to fit" for a complete view of the plan.
  - **Metrics and Highlighting**: Highlight key performance indicators, such as elapsed time or subtree cost, to identify bottlenecks in query execution.
- **Schema Compare (Preview)**: Effortless schema synchronization and management
  - Compare schemas between two databases, DACPAC files, or SQL projects and see additions, removals, and modifications at a glance
  - Filter and exclude specific differences before syncing
  - Apply changes directly or generate a deployment script for later use
  - Save comparisons to rerun or audit schema changes
- **Customizable Extension Options**: Configure command shortcuts, appearance, and other settings to personalize your development experience.

<img src="https://github.com/Microsoft/vscode-mssql/raw/main/images/mssql-demo.gif" alt="demo" style="width:480px;"/>

Get started today and experience a streamlined SQL development workflow with **mssql** for Visual Studio Code!

* See [the mssql extension tutorial] for the step by step guide.
* See [the SQL developer tutorial] to develop an app with C#, Java, Node.js, PHP, Python and R with SQL Server databases.
* Discover more about developing locally with Azure SQL Database by following the [Azure SQL local development overview](https://learn.microsoft.com/azure/azure-sql/database/local-dev-experience-overview).
* Explore a variety of resources for Azure SQL Database development by visiting [Azure SQL Database developer resources](https://azure.microsoft.com/en-us/products/azure-sql/database#tabs-pill-bar-oc0283_tab2).

## Using

* First, install [Visual Studio Code] then install **mssql** extension by pressing **F1** or **ctrl+shift+p** to open command palette, select **Install Extension** and type **mssql**.
    * For macOS, you will need to install OpenSSL. Follow the install pre-requisite steps from [DotNet Core instructions].
* Open an existing file with a .sql file extension or open a new text file (**ctrl+n**) and change the language mode to SQL by pressing **ctrl+k,m** and select **SQL**. **mssql** commands and functionalities are enabled in the SQL language mode in Visual Studio Code editor.
* Create a new connection profile using command palette by pressing **F1**, type **sqlman** to run **MS SQL: Manage Connection Profile** command. Select **Create**. See [manage connection profiles] for more information about how to create and edit connection profiles in your User Settings (settings.json) file.
* Connect to a database by pressing **F1** and type **sqlcon** to run **MS SQL: Connect** command, then select a connection profile. You can also use a shortcut (**ctrl+shift+c**).
* Write T-SQL script in the editor using IntelliSense and Snippets. Type **sql** in the editor to list T-SQL Snippets.
* Execute T-SQL script or selection of statements in the script by pressing **F1** and type **sqlex** to run **MS SQL: Execute Query** command. You can also use a shortcut (**ctrl+shift+e**). See [customize shortcuts] to learn about change shortcut key bindings to **mssql** commands.
* View the T-SQL script execution results and messages in result view.

## Commands
The extension provides several commands in the Command Palette for working with ```.sql``` files:
* **MS SQL: Connect** to SQL Server, Azure SQL Database or SQL Data Warehouse using connection profiles or recent connections.
    * **Create Connection Profile** to create a new connection profile and connect.
* **MS SQL: Disconnect** from SQL Server, Azure SQL Database or SQL Data Warehouse in the editor session.
* **MS SQL: Use Database** to switch the database connection to another database within the same connected server in the editor session.
* **MS SQL: Execute Query** script, T-SQL statements or batches in the editor.
* **MS SQL: Cancel Query** execution in progress in the editor session.
* **MS SQL: Manage Connection Profiles**
    * **Create** a new connection profile using command palette's step-by-step UI guide.
    * **Edit** user settings file (settings.json) in the editor to manually create, edit or remove connection profiles.
    * **Remove** an existing connection profile using command palette's step-by-step UI guide.
    * **Clear Recent Connection List** to clear the history of recent connections.

## Options
The following Visual Studio Code settings are available for the mssql extension. These can be set in user preferences (cmd+,) or workspace settings ```(.vscode/settings.json)```.
See [customize options] and [manage connection profiles] for more details.

```javascript
{
    "mssql.maxRecentConnections": 5,
    "mssql.connections":[],
    "mssql.shortcuts": {
        "event.toggleResultPane": "ctrl+alt+r",
        "event.toggleMessagePane": "ctrl+alt+y",
        "event.prevGrid": "ctrl+up",
        "event.nextGrid": "ctrl+down",
        "event.copySelection": "ctrl+c",
        "event.maximizeGrid": "",
        "event.selectAll": "",
        "event.saveAsJSON": "",
        "event.saveAsCSV": "",
        "event.saveAsExcel": ""
    },
    "mssql.messagesDefaultOpen": true,
    "mssql.logDebugInfo": false,
    "mssql.saveAsCsv.includeHeaders": true,
    "mssql.saveAsCsv.delimiter": ",",
    "mssql.saveAsCsv.lineSeparator": null,
    "mssql.saveAsCsv.textIdentifier": "\"",
    "mssql.saveAsCsv.encoding": "utf-8",
    "mssql.intelliSense.enableIntelliSense": true,
    "mssql.intelliSense.enableErrorChecking": true,
    "mssql.intelliSense.enableSuggestions": true,
    "mssql.intelliSense.enableQuickInfo": true,
    "mssql.intelliSense.lowerCaseSuggestions": false,
    "mssql.resultsFontFamily": null,
    "mssql.resultsFontSize": null,
    "mssql.copyIncludeHeaders": false,
    "mssql.copyRemoveNewLine" : true,
    "mssql.splitPaneSelection": "next",
    "mssql.format.alignColumnDefinitionsInColumns": false,
    "mssql.format.datatypeCasing": "none",
    "mssql.format.keywordCasing": "none",
    "mssql.format.placeCommasBeforeNextStatement": false,
    "mssql.format.placeSelectStatementReferencesOnNewLine": false,
    "mssql.applyLocalization": false,
    "mssql.query.displayBitAsNumber": true,
    "mssql.persistQueryResultTabs": false,
    "mssql.enableRichExperiences": true,
    "mssql.openQueryResultsInTabByDefault": false
    "mssql.enableNewQueryResultsFeature": false
}
```

## Change Log
See the [change log] for a detailed list of changes in each version.

## Supported Operating Systems

Currently this extension supports the following operating systems:

* Windows (x64 | x86 | arm64)
* macOS (x64 | arm64)
* Ubuntu 14.04 / Linux Mint 17 / Linux Mint 18 / Elementary OS 0.3
* Ubuntu 16.04 / Elementary OS 0.4
* Debian 8.2
* CentOS 7.1 / Oracle Linux 7
* Red Hat Enterprise Linux (RHEL)
* Fedora 23
* OpenSUSE 13.2
* Linux arm64

## Offline Installation
The extension will download and install a required SqlToolsService package during activation. For machines with no Internet access, you can still use the extension by choosing the
`Install from VSIX...` option in the Extension view and installing a bundled release from our [Releases](https://github.com/Microsoft/vscode-mssql/releases) page.
Each operating system has a .vsix file with the required service included. Pick the file for your OS, download and install to get started.
We recommend you choose a full release and ignore any alpha or beta releases as these are our daily builds used in testing.

## Support
Support for this extension is provided on our [GitHub Issue Tracker]. You can submit a [bug report], a [feature suggestion] or participate in [discussions].

## Contributing to the Extension
See the [developer documentation] for details on how to contribute to this extension.

## Code of Conduct
This project has adopted the [Microsoft Open Source Code of Conduct]. For more information see the [Code of Conduct FAQ] or contact [opencode@microsoft.com] with any additional questions or comments.

## Telemetry
This extension collects telemetry data, which is used to help understand how to improve the product. For example, this usage data helps to debug issues, such as slow start-up times, and to prioritize new features. While we appreciate the insights this data provides, we also know that not everyone wants to send usage data and you can disable telemetry as described in the VS Code [disable telemetry reporting](https://code.visualstudio.com/docs/getstarted/telemetry#_disable-telemetry-reporting) documentation.

## Privacy Statement
The [Microsoft Enterprise and Developer Privacy Statement] describes the privacy statement of this software.

## License
This extension is [licensed under the MIT License]. Please see the [third-party notices] file for additional copyright notices and license terms applicable to portions of the software.

[the mssql extension tutorial]:https://aka.ms/mssql-getting-started
[the SQL Developer tutorial]: https://aka.ms/sqldev
[Visual Studio Code]: https://code.visualstudio.com/#alt-downloads
[DotNet Core instructions]:https://www.microsoft.com/net/core
[manage connection profiles]:https://github.com/Microsoft/vscode-mssql/wiki/manage-connection-profiles
[customize shortcuts]:https://github.com/Microsoft/vscode-mssql/wiki/customize-shortcuts
[customize options]:https://github.com/Microsoft/vscode-mssql/wiki/customize-options
[change log]: https://github.com/Microsoft/vscode-mssql/blob/main/CHANGELOG.md
[GitHub Issue Tracker]:https://github.com/Microsoft/vscode-mssql/issues
[bug report]:https://github.com/Microsoft/vscode-mssql/issues/new
[feature suggestion]:https://github.com/Microsoft/vscode-mssql/issues/new
[developer documentation]:https://github.com/Microsoft/vscode-mssql/wiki/contributing
[Microsoft Enterprise and Developer Privacy Statement]:https://go.microsoft.com/fwlink/?LinkId=786907&lang=en7
[licensed under the MIT License]: https://github.com/Microsoft/vscode-mssql/blob/main/LICENSE.txt
[third-party notices]: https://github.com/Microsoft/vscode-mssql/blob/main/ThirdPartyNotices.txt
[Microsoft Open Source Code of Conduct]:https://opensource.microsoft.com/codeofconduct/
[Code of Conduct FAQ]:https://opensource.microsoft.com/codeofconduct/faq/
[opencode@microsoft.com]:mailto:opencode@microsoft.com
[#669]:https://github.com/Microsoft/vscode-mssql/issues/669

