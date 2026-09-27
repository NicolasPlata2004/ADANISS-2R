function P = ParametrosTrebol()
% GUI mínima para definir parámetros del trébol ANTES de calcular la trayectoria.
% No grafica nada (la figura de la trayectoria la hace TrebolLive).
% Bloquea hasta "Aceptar" y devuelve struct P; también deja las variables
% en el workspace base como respaldo.

% --- valores por defecto (los de TrebolLive) ---
def = struct('Npetalos',4,'escala',1,'angulo',0,'t',10, ...
             'a',0.1022,'f',0.2,'g',0.2, ...
             'tin',3,'tcal',4,'tstop',1, ...
             'puerto',"COM5",'baudios',115200);

% campo, etiqueta, tipo ('%d' entero, '%g' real, '%s' texto)
campos = { ...
  'Npetalos','N° de pétalos','%d'; ...
  'escala','Escala','%g'; ...
  'angulo','Rotación [°]','%g'; ...
  't','Tiempo ciclo [s]','%g'; ...
  'a','Radio base a [m]','%g'; ...
  'f','Centro f [m]','%g'; ...
  'g','Centro g [m]','%g'; ...
  'tin','T. aproximación [s]','%g'; ...
  'tcal','T. calibración [s]','%g'; ...
  'tstop','T. detenido [s]','%g'; ...
  'puerto','Puerto serial','%s'; ...
  'baudios','Baudios','%d'};

n = size(campos,1);
fig = uifigure('Name','Parámetros del Trébol','Position',[500 300 360 n*34+70]);
gl = uigridlayout(fig,[n+1 2]);
gl.RowHeight = repmat({30},1,n+1);
gl.ColumnWidth = {170,'1x'};

ed = gobjects(n,1);
for k=1:n
    lbl = uilabel(gl,'Text',campos{k,2});
    lbl.Layout.Row = k; lbl.Layout.Column = 1;
    val = def.(campos{k,1});
    if isstring(val)||ischar(val), txt = char(val); else, txt = num2str(val); end
    ed(k) = uieditfield(gl,'text','Value',txt);
    ed(k).Layout.Row = k; ed(k).Layout.Column = 2;
end

btn = uibutton(gl,'Text','Aceptar y calcular');
btn.Layout.Row = n+1; btn.Layout.Column = [1 2];
btn.ButtonPushedFcn = @(~,~) uiresume(fig);

uiwait(fig);   % <-- BLOQUEA hasta que se presione Aceptar

% --- recoger valores ---
P = def;
if isvalid(fig)
    for k=1:n
        nombre = campos{k,1}; raw = ed(k).Value;
        if strcmp(campos{k,3},'%s')
            P.(nombre) = string(raw);
        else
            v = str2double(raw);
            if isnan(v), v = def.(nombre); end
            if strcmp(campos{k,3},'%d'), v = round(v); end
            P.(nombre) = v;
        end
    end
    delete(fig);
end

% --- respaldo: dejar variables en el workspace base ---
fns = fieldnames(P);
for k=1:numel(fns), assignin('base', fns{k}, P.(fns{k})); end
end