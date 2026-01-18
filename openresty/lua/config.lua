-- Configuration for JavaScript injection
local _M = {}

-- Scripts to inject (in order)
_M.scripts = {
    {
        src = "/assets/js/runtime/1.0.0/runtime.min.js",
        position = "head",  -- 'head' or 'body'
        enabled = true
    },
    {
        src = "/assets/js/admin/1.0.0/admin.min.js",
        position = "body",
        enabled = true
    }
}

-- Only inject into HTML responses
_M.should_inject = function()
    local content_type = ngx.header.content_type
    if not content_type then
        return false
    end
    return string.match(content_type, "text/html")
end

return _M
