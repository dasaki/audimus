<%@ page import="java.sql.*" %>
<%
String email=request.getParameter("email");
if(email.contains("@")&&email.contains(".")){
try{
Class.forName("oracle.jdbc.driver.OracleDriver");
Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:xe","system","oracle");
PreparedStatement ps=con.prepareStatement("select * from user100 where email=?");
ps.setString(1,email);
ResultSet rs=ps.executeQuery();
if(rs.next()){
out.print("Unavailable! <img src='unchecked.gif'/>");
}else{
out.print("Available! <img src='checked.gif'/>");
}
}catch(Exception e){out.print(e);}
}else{
out.print("Invalid email!");
}
%>