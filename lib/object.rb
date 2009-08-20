class Object
  def jsonize(d)
    def surround(d, i=0); '' << '"[{'[i] << d << '"]}'[i]; end
    alias j jsonize; alias s surround
    if d.kind_of?(String) then s(d)
    elsif d.kind_of?(Symbol) then s(d.to_s)
    elsif d.kind_of?(Array) then s(d.collect {|v| j(v)}.join(', '), 1)
    elsif d.kind_of?(Hash) then s(d.to_a.collect { |v| "#{j(v[0])} : #{j(v[1])}" }.join(', '),2)
    # add support for other types of objects here if needed...
    else d.to_s; end
  end  
  
  def to_json
    jsonize(self)
  end  
end
