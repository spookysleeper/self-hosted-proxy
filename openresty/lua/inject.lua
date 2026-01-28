-- Body filter to inject JavaScript into HTML responses
local config = require("config")

local _M = {}

function _M.filter()
    ngx.log(ngx.ERR, "[Inject] Body filter called")
    
    -- Only inject into HTML responses
    local content_type = ngx.header.content_type
    ngx.log(ngx.ERR, "[Inject] Content-Type: ", content_type or "nil")
    
    if not content_type or not string.match(content_type, "text/html") then
        ngx.log(ngx.ERR, "[Inject] Skipping - not HTML")
        return
    end

    -- Buffer all chunks in ngx.ctx
    local chunk = ngx.arg[1]
    local eof = ngx.arg[2]
    ngx.ctx.buffered = (ngx.ctx.buffered or "") .. (chunk or "")

    if not eof then
        ngx.arg[1] = nil  -- Don't send anything yet
        return
    end

    ngx.log(ngx.ERR, "[Inject] Processing final chunk, buffer size: ", #ngx.ctx.buffered)

    local body = ngx.ctx.buffered

    -- Inject a script to patch Pusher/Echo WebSocket host BEFORE any other scripts run
    -- This MUST be the first script in <head> to intercept WebSocket connections
    local pusher_patch = [[

<script>
(function() {
    console.log('[Proxy] Installing WebSocket patch...');
    var OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        var newUrl = url;
        // Replace localhost:6001 and localhost:6002 with current host
        if (url.indexOf('localhost:6001') !== -1) {
            newUrl = url.replace('localhost:6001', window.location.host);
            console.log('[Proxy] WebSocket URL rewritten:', url, '->', newUrl);
        } else if (url.indexOf('localhost:6002') !== -1) {
            newUrl = url.replace('localhost:6002', window.location.host);
            console.log('[Proxy] WebSocket URL rewritten:', url, '->', newUrl);
        }
        if (protocols) {
            return new OriginalWebSocket(newUrl, protocols);
        }
        return new OriginalWebSocket(newUrl);
    };
    // Copy static properties
    for (var prop in OriginalWebSocket) {
        if (OriginalWebSocket.hasOwnProperty(prop)) {
            window.WebSocket[prop] = OriginalWebSocket[prop];
        }
    }
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    console.log('[Proxy] WebSocket patch installed successfully');
})();
</script>]]
    -- Inject the pusher patch as the FIRST thing after <head> opening tag
    local count
    body, count = string.gsub(body, "(<head[^>]*>)", "%1" .. pusher_patch, 1)
    ngx.log(ngx.ERR, "[Inject] WebSocket patch injection count: ", count)

    -- Build script tags
    local head_scripts = {}
    local body_scripts = {}

    for _, script in ipairs(config.scripts) do
        if script.enabled then
            local tag = string.format('<script src="%s" defer></script>\n', script.src)
            if script.position == "head" then
                table.insert(head_scripts, tag)
            else
                table.insert(body_scripts, tag)
            end
        end
    end

    -- Inject before </head>
    if #head_scripts > 0 then
        local head_injection = table.concat(head_scripts, "")
        body = string.gsub(body, "</head>", head_injection .. "</head>", 1)
    end

    -- Inject before </body>
    if #body_scripts > 0 then
        local body_injection = table.concat(body_scripts, "")
        body = string.gsub(body, "</body>", body_injection .. "</body>", 1)
    end

    ngx.arg[1] = body
end

return _M

