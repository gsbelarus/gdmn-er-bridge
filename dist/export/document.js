"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
async function loadDocument(connection, transaction, loadDocumentFunc) {
    await gdmn_db_1.AConnection.executeQueryResultSet({
        connection,
        transaction,
        sql: `
      SELECT
        dt.id,
        dt.ruid,
        prnt.ruid AS parent_ruid,
        prnt.documenttype AS parent_documenttype,
        dt.documenttype,
        dt.name,
        dt.classname,
        root.classname AS root_classname,
        headerrel.relationname AS hr,
        linerel.relationname AS lr
      FROM
        gd_documenttype dt
        LEFT JOIN gd_documenttype prnt
          ON prnt.id = dt.parent
        JOIN gd_documenttype root
          ON root.lb <= dt.lb AND root.rb >= dt.rb AND root.parent IS NULL
        LEFT JOIN at_relations headerrel
          ON headerrel.id = dt.headerrelkey
        LEFT JOIN at_relations linerel
          ON linerel.id = dt.linerelkey
      ORDER BY
        dt.lb`,
        callback: async (rs) => {
            while (await rs.next()) {
                if (rs.getString("DOCUMENTTYPE") === "D") {
                    loadDocumentFunc(rs.getNumber("ID"), rs.getString("RUID"), !rs.isNull("PARENT_RUID") && rs.getString("PARENT_DOCUMENTTYPE") === "D" ? rs.getString("PARENT_RUID") : "", rs.getString("NAME"), rs.getString("CLASSNAME") ? rs.getString("CLASSNAME") : rs.getString("ROOT_CLASSNAME"), rs.getString("HR"), rs.isNull("LR") ? "" : rs.getString("LR"));
                }
            }
        }
    });
}
exports.loadDocument = loadDocument;
//# sourceMappingURL=document.js.map