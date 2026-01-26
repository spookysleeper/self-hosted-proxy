-- Body filter to inject JavaScript into HTML responses
local config = require("config")

local _M = {}

function _M.filter()
    -- Only process on the last chunk
    if not ngx.arg[2] then
        return
    end

    -- Check if we should inject
    if not config.should_inject() then
        return
    end

    local body = ngx.arg[1]

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

