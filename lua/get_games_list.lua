-- LUA implementation of server part of vnds-online. Could be used instead of PHP. 
-- Original PHP code author: VaYurik https://github.com/VaYurik
-- Lua port author: DeXP https://dexp.in

function getSubDirectories(root)
    local i, t = 0, {}
    for entity in lfs.dir(root) do
        if entity ~= "." and entity ~= ".." then
            if "directory" == lfs.attributes(root.."/"..entity, "mode") then
              i = i + 1
              t[i] = entity
            end
        end
    end
    return t
end

function getFullFileName(root, fileName)
    for entity in lfs.dir(root) do
        if string.sub(entity, 1, string.len(fileName)) == fileName then
            return root.."/"..entity
        end
    end
end

function file_exists(name)
    local f = io.open(name,"r")
    if f ~= nil then io.close(f) return true else return false end
end



allGames = {}
local NullPlaceholder = "\0"
local gameDirectories = getSubDirectories("games")
for index, dir in ipairs(gameDirectories) do
    local gameDir = "games/"..dir
    local infoFile = gameDir.."/info.txt"
    local imgFile = gameDir.."/img.ini"

    game = {}
    game.dir = gameDir
    game.short_name = dir
    game.error = NullPlaceholder
    game.full_name = NullPlaceholder
    game.font = NullPlaceholder
    game.text_size = NullPlaceholder
    game.line_height = NullPlaceholder
    game.bg_color = NullPlaceholder

    infoFileHandle = io.open(infoFile)
    if not infoFileHandle then 
        game.error = "Ошибка чтения файла "..infoFile;
    else
        for line in infoFileHandle:lines() do
            local key, value = line:match("^([%w_]+)%s-=%s-(.+)$")

            if     key == "title" then game.full_name = value
            elseif key == "font" then
                local fontFile = gameDir.."/font/"..value

                if file_exists(fontFile) then game.font = fontFile
                else game.error = "Ошибка в файле "..infoFile.."<br/><br/>Шрифт "..fontFile.." не найден"
                end
            elseif key == "text_size" then
                local em = value:match("^(.*)em")
                local px = value:match("^(.*)px")
                local pc = value:match("^(.*)%%")
                if (em and tonumber(em)) then
                    game.text_size = em
                elseif (px and tonumber(px)) then
                    flt = tonumber(px) 
                    game.text_size = flt / 16
                elseif (pc and tonumber(pc)) then
                    flt = tonumber(pc)
                    game.text_size = flt / 100
                else 
                    game.error = "Ошибка в файле "..infoFile.."<br/><br/>Неверный размер шрифта"
                end
            elseif key == "line_height" then
                if (value and tonumber(value)) then
                    game.line_height = value
                else
                    game.error = "Ошибка в файле "..infoFile.."<br/><br/>Неверная высота строки"
                end
            elseif key == "bg_color" then
                local color = value:match("#%d+")
                if (color and ((4 == #value) or (7 == #value))) then
                    -- if 'color' starts with # and have 4 or 7 characters inside
                    game.bg_color = value
                else
                    game.error = "Ошибка в файле "..infoFile.."<br/><br/>Неверный код цвета"
                end
            end
        end

        if NullPlaceholder == game.full_name then game.error = "Неверный формат файла "..infoFile.."<br/><br/>Отсутствует название игры" end
    end


    game.width = NullPlaceholder
    game.height = NullPlaceholder

    imgFileHandle = io.open(imgFile)
    if not imgFileHandle then 
        game.error = "Ошибка чтения файла "..imgFile;
    else
        for line in imgFileHandle:lines() do
            local key, value = line:match("^([%w_]+)%s-=%s-(.+)$")
            if     key == "width"  then game.width = value
            elseif key == "height" then game.height = value
            end
        end

        if NullPlaceholder == game.width  then game.error = "Ошибка в файле "..imgFile.."<br/><br/>Не задана ширина (width)" end
        if NullPlaceholder == game.height then game.error = "Ошибка в файле "..imgFile.."<br/><br/>Не задана высота (height)" end
    end

    game.icon_s  = getFullFileName(gameDir, "icon.")
    game.icon_b  = getFullFileName(gameDir, "icon-high.")
    game.thumb_s = getFullFileName(gameDir, "thumbnail.")
    game.thumb_b = getFullFileName(gameDir, "thumbnail-high.")


    allGames[index] = game
end


local JSON = require "JSON"
mg.write("HTTP/1.0 200 OK\r\nContent-Type: application/json\r\n\r\n")
mg.write(JSON:encode(allGames, nil, { null = NullPlaceholder, pretty = true, indent = "  " }))
