package edu.tum.cit.sse.compiler.models;

import java.io.*;

public class CompilerProcess {
    private String command;
    private InputStream stdoutStream;
    private InputStream stderrStream;
    private String stdout = "";
    private String stderr = "";
    private Process process;
    private int exitValue;

    public CompilerProcess(String command) {
        this.command = command;
    }

    private String collectOutput(InputStream stream) throws IOException {
        String line;
        StringBuilder output = new StringBuilder();
        BufferedReader in = new BufferedReader(
                new InputStreamReader(stream));
        while ((line = in.readLine()) != null) {
            output.append(line);
            output.append("\n");
        }
        return output.toString();
    }

    public void compile(String code, String fileName) throws IOException {
        File file = new File(System.getProperty("java.io.tmpdir") + File.separator + fileName);
        FileWriter fileWriter = new FileWriter(file);
        fileWriter.write(code);
        fileWriter.close();
        compile(file);
    }

    public void compile(File file) {
        try {
            String execCommand = command + file.getAbsolutePath();
            process = Runtime.getRuntime().exec(execCommand);
            stdoutStream = process.getInputStream();
            stderrStream = process.getErrorStream();
            stdout = collectOutput(stdoutStream);
            stderr = collectOutput(stderrStream);
            process.waitFor();
            exitValue = process.exitValue();
            file.delete();
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public InputStream getStdoutStream() {
        return stdoutStream;
    }

    public void setStdoutStream(InputStream stdoutStream) {
        this.stdoutStream = stdoutStream;
    }

    public InputStream getStderrStream() {
        return stderrStream;
    }

    public void setStderrStream(InputStream stderrStream) {
        this.stderrStream = stderrStream;
    }

    public String getStdout() {
        return stdout;
    }

    public void setStdout(String stdout) {
        this.stdout = stdout;
    }

    public String getStderr() {
        return stderr;
    }

    public void setStderr(String stderr) {
        this.stderr = stderr;
    }

    public Process getProcess() {
        return process;
    }

    public void setProcess(Process process) {
        this.process = process;
    }

    public int getExitValue() {
        return exitValue;
    }

    public void setExitValue(int exitValue) {
        this.exitValue = exitValue;
    }
}
