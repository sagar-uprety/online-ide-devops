package edu.tum.cit.sse.compiler.services;

import edu.tum.cit.sse.compiler.models.CompilerProcess;
import edu.tum.cit.sse.compiler.models.SourceCodeDto;
import org.springframework.stereotype.Service;

import javax.xml.ws.http.HTTPException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


@Service
public class CompilerService {
    public SourceCodeDto compile(SourceCodeDto sourceCode) throws IOException {
        String command = getCompilerCommandForFile(sourceCode.getFileName());
        CompilerProcess process = new CompilerProcess(command);
        process.compile(sourceCode.getCode(), sourceCode.getFileName());
        sourceCode.setCompilable(process.getExitValue() == 0);
        sourceCode.setStdout(process.getStdout());
        sourceCode.setStderr(process.getStderr());
        return sourceCode;
    }

    private String getCompilerCommandForFile(String fileName) {
        String[] tokens = fileName.split("\\.(?=[^\\.]+$)");
        String ext = tokens[1];
        Map<String, String> commands = getCompilerCommands();
        if (!commands.containsKey(ext)) {
            throw new HTTPException(405);
        }
        return commands.get(ext);
    }

    public Map<String, String> getCompilerCommands() {
        Map<String, String> commandMap = new HashMap<String, String>();
        commandMap.put("java", "javac ");
        commandMap.put("c", "clang ");
        return commandMap;
    }
}
