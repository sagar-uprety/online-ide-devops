package edu.tum.cit.sse.compiler.models;

public class SourceCodeDto {
    private String code;
    private String fileName;
    private String fileUrl;
    private String stdout;
    private String stderr;
    private boolean isCompilable = false;

    public SourceCodeDto() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public boolean isCompilable() {
        return isCompilable;
    }

    public void setCompilable(boolean compilable) {
        isCompilable = compilable;
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
}
