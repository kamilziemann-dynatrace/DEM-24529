(function () {
    function byId(id) {
        return document.getElementById(id);
    }

    function timestamp() {
        return new Date().toISOString();
    }

    function log(message, kind) {
        var logContainer = byId("event-log");
        if (!logContainer) {
            return;
        }

        var line = document.createElement("div");
        line.className = "log-line" + (kind ? " log-" + kind : "");
        line.textContent = timestamp() + " | " + message;
        logContainer.appendChild(line);
    }

    function clearLog() {
        var logContainer = byId("event-log");
        if (logContainer) {
            logContainer.innerHTML = "";
        }
    }

    function setStatus(message, kind) {
        var statusNode = byId("status");
        if (!statusNode) {
            return;
        }

        statusNode.textContent = message;
        statusNode.className = "status-box" + (kind ? " " + kind : "");
    }

    function withCacheBust(path) {
        var separator = path.indexOf("?") === -1 ? "?" : "&";
        return path + separator + "ts=" + Date.now() + "-" + Math.random().toString(16).slice(2);
    }

    function xhrGet(path, label) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            var requestUrl = withCacheBust(path);
            var requestLabel = label || path;

            log("XHR START: " + requestLabel + " -> " + requestUrl);
            xhr.open("GET", requestUrl, true);

            xhr.onload = function () {
                var ok = xhr.status >= 200 && xhr.status < 400;
                log("XHR DONE (" + xhr.status + "): " + requestLabel, ok ? "success" : "error");
                if (ok) {
                    resolve(xhr);
                    return;
                }

                reject(new Error("XHR failed with status " + xhr.status + " for " + requestLabel));
            };

            xhr.onerror = function () {
                log("XHR ERROR: " + requestLabel, "error");
                reject(new Error("Network error for " + requestLabel));
            };

            xhr.send();
        });
    }

    function readJson(xhr) {
        try {
            return JSON.parse(xhr.responseText);
        } catch (error) {
            return null;
        }
    }

    function shouldAutorun() {
        var params = new URLSearchParams(window.location.search);
        return params.get("autorun") === "1";
    }

    function updateRunMode() {
        var node = byId("run-mode");
        if (!node) {
            return;
        }

        node.textContent = shouldAutorun() ? "autorun enabled" : "manual mode";
    }

    window.scenarioUtils = {
        byId: byId,
        clearLog: clearLog,
        log: log,
        readJson: readJson,
        setStatus: setStatus,
        shouldAutorun: shouldAutorun,
        updateRunMode: updateRunMode,
        withCacheBust: withCacheBust,
        xhrGet: xhrGet
    };
})();